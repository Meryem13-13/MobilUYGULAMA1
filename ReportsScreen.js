// src/screens/ReportsScreen.js

import { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { loadCompletedTodos } from "../storage/completedStorage"; // ⭐ yeni eklenen
import { getAllSessions } from "../storage/sessionStorage";
import { ThemeContext } from "../theme/ThemeContext";

import { BarChart, PieChart } from "react-native-gifted-charts";

// Rastgele kategori rengi
const categoryColors = {};
const getColor = (name) => {
  if (!categoryColors[name]) {
    categoryColors[name] =
      `hsl(${Math.floor(Math.random() * 360)}, 70%, 55%)`;
  }
  return categoryColors[name];
};

export default function ReportsScreen() {
  const { theme } = useContext(ThemeContext);

  const [sessions, setSessions] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]); // ⭐ yeni

  const [todayMinutes, setTodayMinutes] = useState(0);
  const [weekMinutes, setWeekMinutes] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalDistractions, setTotalDistractions] = useState(0);

  const [dailySummary, setDailySummary] = useState(null);

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [mode, setMode] = useState("weekly");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const all = await getAllSessions();
    const focus = all.filter((s) => s.type === "focus");
    setSessions(focus);

    const todos = await loadCompletedTodos(); // ⭐ görevler çekiliyor
    setCompletedTodos(todos);

    computeBasicStats(focus);
    computeRange("weekly", focus);
    computeDailySummary(focus);
  };

  // ---------------------- GÜNLÜK ÖZET ------------------------
  const computeDailySummary = (data) => {
    const today = new Date().toDateString();

    const todayData = data.filter(
      (s) => new Date(s.date).toDateString() === today
    );

    if (todayData.length === 0) {
      setDailySummary(null);
      return;
    }

    const total = todayData.reduce((acc, x) => acc + x.durationMinutes, 0);
    const distractions = todayData.reduce((acc, x) => acc + x.distractions, 0);
    const sessionsCount = todayData.length;

    const cats = {};
    let breakCount = 0;

    todayData.forEach((s) => {
      if (!cats[s.category]) cats[s.category] = 0;
      cats[s.category] += s.durationMinutes;

      if (s.type === "break") breakCount++;
    });

    const mostUsed = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];

    setDailySummary({
      total,
      distractions,
      sessionsCount,
      mostCategory: mostUsed ? mostUsed[0] : "-",
      breaks: breakCount,
    });
  };

  // ---------------------- TEMEL İSTATİSTİK ------------------------
  const computeBasicStats = (data) => {
    const now = new Date();

    const today = new Date().toDateString();
    const t = data
      .filter((s) => new Date(s.date).toDateString() === today)
      .reduce((a, b) => a + b.durationMinutes, 0);
    setTodayMinutes(t);

    const w = data
      .filter((s) => (now - new Date(s.date)) / 86400000 <= 7)
      .reduce((a, b) => a + b.durationMinutes, 0);
    setWeekMinutes(w);

    const total = data.reduce((a, b) => a + b.durationMinutes, 0);
    setTotalMinutes(total);

    const dis = data.reduce((a, b) => a + b.distractions, 0);
    setTotalDistractions(dis);
  };

  // ---------------------- FİLTRE ------------------------
  const computeRange = (type, all) => {
    setMode(type);
    const now = new Date();

    const diffDays = (d) => (now - new Date(d)) / 86400000;
    let filtered = [];

    if (type === "daily") filtered = all.filter((s) => diffDays(s.date) <= 1);
    if (type === "weekly") filtered = all.filter((s) => diffDays(s.date) <= 7);
    if (type === "monthly") filtered = all.filter((s) => diffDays(s.date) <= 30);
    if (type === "yearly") filtered = all.filter((s) => diffDays(s.date) <= 365);
    if (type === "all") filtered = all;

    computeBar(filtered, now);
    computeLine(filtered, now);
    computePie(filtered);
    computeCategoryList(filtered);
  };

  // ---------------------- BAR ------------------------
  const computeBar = (filtered, now) => {
    const days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(5, 10);
      days[key] = 0;
    }

    filtered.forEach((s) => {
      const k = s.date.slice(5, 10);
      if (days[k] !== undefined) days[k] += s.durationMinutes;
    });

    setBarData(
      Object.keys(days).map((k) => ({
        value: days[k],
        label: k,
        frontColor: theme.accent,
      }))
    );
  };

  // ---------------------- LINE ------------------------
  const computeLine = (filtered, now) => {
    const days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(5, 10);
      days[key] = 0;
    }

    filtered.forEach((s) => {
      const k = s.date.slice(5, 10);
      if (days[k] !== undefined) days[k] += s.durationMinutes;
    });

    setLineData(
      Object.keys(days).map((k) => ({
        value: days[k],
        dataPointText: `${days[k]} dk`,
      }))
    );
  };

  // ---------------------- PIE ------------------------
  const computePie = (filtered) => {
    const cats = {};

    filtered.forEach((s) => {
      if (!cats[s.category]) cats[s.category] = 0;
      cats[s.category] += s.durationMinutes;
    });

    setPieData(
      Object.keys(cats).map((c) => ({
        value: cats[c],
        text: c,
        color: getColor(c),
      }))
    );
  };

  // ---------------------- CATEGORY LIST ------------------------
  const computeCategoryList = (filtered) => {
    const cats = {};

    filtered.forEach((s) => {
      if (!cats[s.category]) cats[s.category] = 0;
      cats[s.category] += s.durationMinutes;
    });

    setCategoryList(
      Object.keys(cats).map((c) => ({
        name: c,
        minutes: cats[c],
        color: getColor(c),
      }))
    );
  };

  return (
    <ScrollView style={{ padding: 16, backgroundColor: theme.background }}>

      {/* ---------------------- FİLTRE BUTONLARI ---------------------- */}
      <View style={styles.filterRow}>
        {[
          { key: "daily", label: "Bugün" },
          { key: "weekly", label: "Hafta" },
          { key: "monthly", label: "Ay" },
          { key: "yearly", label: "Yıl" },
          { key: "all", label: "Tümü" },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => computeRange(f.key, sessions)}
            style={[
              styles.filterBtn,
              {
                backgroundColor:
                  mode === f.key ? theme.accent : theme.card,
              },
            ]}
          >
            <Text
              style={{
                color: mode === f.key ? "#fff" : theme.textPrimary,
                fontWeight: "700",
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ---------------------- GÜNLÜK ÖZET ---------------------- */}
      {dailySummary && (
        <View style={[styles.dailyCard, { backgroundColor: theme.card }]}>
          <Text style={styles.dailyTitle}>📅 Günlük Özet</Text>

          <Text style={styles.dailyText}>
            • Toplam Süre: {dailySummary.total} dk
          </Text>
          <Text style={styles.dailyText}>
            • Seans Sayısı: {dailySummary.sessionsCount}
          </Text>
          <Text style={styles.dailyText}>
            • Dikkat Dağınıklığı: {dailySummary.distractions}
          </Text>
          <Text style={styles.dailyText}>
            • En Çok Kullanılan Kategori: {dailySummary.mostCategory}
          </Text>
          <Text style={styles.dailyText}>
            • Toplam Mola Sayısı: {dailySummary.breaks}
          </Text>
        </View>
      )}

      {/* ---------------------- KPI CARDS ---------------------- */}
      <View style={styles.kpiContainer}>
        {[
          { title: "Bugün", value: todayMinutes + " dk" },
          { title: "Bu Hafta", value: weekMinutes + " dk" },
          { title: "Toplam", value: totalMinutes + " dk" },
          { title: "Dağınıklık", value: totalDistractions },
        ].map((item, i) => (
          <View key={i} style={[styles.kpiBox, { backgroundColor: theme.card }]}>
            <Text style={styles.kpiTitle}>{item.title}</Text>
            <Text style={[styles.kpiValue, { color: theme.accent }]}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      {/* ---------------------- GRAFİKLER YAN YANA ---------------------- */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        
        {/* BAR */}
        <View style={[styles.smallCard, { backgroundColor: theme.card }]}>
          <Text style={styles.sectionTitle}>Son 7 Gün</Text>

          <BarChart
            data={barData}
            barWidth={22}
            spacing={10}
            roundedTop
            hideRules
            frontColor={theme.accent}
            noOfSections={4}
            height={180}
          />
        </View>

        {/* PIE */}
        <View style={[styles.smallCard, { backgroundColor: theme.card }]}>
          <Text style={styles.sectionTitle}>Kategori</Text>

          <PieChart
            data={pieData}
            donut
            radius={70}
            innerRadius={40}
            textColor={theme.textPrimary}
          />
        </View>
      </View>

      {/* ---------------------- TAMAMLANAN GÖREVLER ---------------------- */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={styles.sectionTitle}>✔ Bugün Tamamlanan Görevler</Text>

        {completedTodos.length === 0 ? (
          <Text style={{ color: theme.textSecondary }}>Görev yok.</Text>
        ) : (
          completedTodos.map((t) => (
            <Text key={t.id} style={styles.todoText}>
              • {t.text}
            </Text>
          ))
        )}
      </View>

      {/* ---------------------- KATEGORİ ÖZETİ ---------------------- */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={styles.sectionTitle}>Kategori Özeti</Text>

        {categoryList.map((c, i) => (
          <View key={i} style={styles.catRow}>
            <View style={[styles.dot, { backgroundColor: c.color }]} />
            <Text style={styles.catName}>{c.name}</Text>

            <View style={styles.progressBar}>
              <View
                style={{
                  width: `${(c.minutes / totalMinutes) * 100}%`,
                  backgroundColor: c.color,
                  height: "100%",
                  borderRadius: 10,
                }}
              />
            </View>
            <Text style={styles.catMin}>{c.minutes} dk</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
  },

  dailyCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  dailyText: {
    fontSize: 14,
    marginBottom: 4,
  },

  kpiContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  kpiBox: {
    width: "48%",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  kpiTitle: {
    fontSize: 13,
    color: "#888",
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },

  smallCard: {
    width: "48%",
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
  },

  card: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  todoText: {
    fontSize: 15,
    marginVertical: 4,
  },

  catRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  catName: {
    width: 90,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  catMin: {
    width: 50,
    textAlign: "right",
  },
});
