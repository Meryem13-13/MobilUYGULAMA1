// src/screens/ReportsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { getAllSessions } from "../storage/sessionStorage";
import {
  BarChart,
  PieChart,
} from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [allTimeTotal, setAllTimeTotal] = useState(0);
  const [totalDistractions, setTotalDistractions] = useState(0);
  const [barData, setBarData] = useState(null);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const all = await getAllSessions();
      setSessions(all);
      calculateStats(all);
    };

    const interval = setInterval(load, 2000); // basit: 2 sn'de bir güncelle
    load();

    return () => clearInterval(interval);
  }, []);

  const calculateStats = (all) => {
    const today = new Date();
    let todaySum = 0;
    let allSum = 0;
    let distractions = 0;

    all.forEach((s) => {
      if (s.type === "focus") {
        const date = new Date(s.date);
        if (date.toDateString() === today.toDateString()) {
          todaySum += s.durationMinutes;
        }
        allSum += s.durationMinutes;
        distractions += s.distractions || 0;
      }
    });

    setTodayTotal(todaySum);
    setAllTimeTotal(allSum);
    setTotalDistractions(distractions);

    prepareBarData(all);
    preparePieData(all);
  };

  const prepareBarData = (all) => {
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      days.push(d);
    }

    const labels = [];
    const data = [];

    days.forEach((d) => {
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      labels.push(label);
      let sum = 0;
      all.forEach((s) => {
        if (s.type === "focus") {
          const sd = new Date(s.date);
          if (sd.toDateString() === d.toDateString()) {
            sum += s.durationMinutes;
          }
        }
      });
      data.push(sum);
    });

    setBarData({
      labels,
      datasets: [{ data }],
    });
  };

  const preparePieData = (all) => {
    const categoryMap = {};

    all.forEach((s) => {
      if (s.type === "focus") {
        const cat = s.category || "Diğer";
        if (!categoryMap[cat]) categoryMap[cat] = 0;
        categoryMap[cat] += s.durationMinutes;
      }
    });

    const colors = ["#22c55e", "#3b82f6", "#f97316", "#a855f7", "#eab308"];

    const pie = Object.keys(categoryMap).map((cat, idx) => ({
      name: cat,
      population: categoryMap[cat],
      color: colors[idx % colors.length],
      legendFontColor: "#e5e7eb",
      legendFontSize: 12,
    }));

    setPieData(pie);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Raporlar</Text>

      {/* Genel İstatistikler */}
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Bugün Toplam</Text>
          <Text style={styles.cardValue}>{todayTotal.toFixed(1)} dk</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tüm Zamanlar</Text>
          <Text style={styles.cardValue}>{allTimeTotal.toFixed(1)} dk</Text>
        </View>
      </View>

      <View style={styles.cardSingle}>
        <Text style={styles.cardLabel}>Toplam Dikkat Dağınıklığı</Text>
        <Text style={styles.cardValue}>{totalDistractions}</Text>
      </View>

      {/* Son 7 Gün Bar Chart */}
      <Text style={styles.sectionTitle}>Son 7 Gün Odaklanma Süreleri</Text>
      {barData && (
        <BarChart
          data={barData}
          width={screenWidth - 32}
          height={220}
          yAxisSuffix=" dk"
          chartConfig={{
            backgroundGradientFrom: "#020617",
            backgroundGradientTo: "#020617",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(229, 231, 235, ${opacity})`,
            propsForBackgroundLines: {
              strokeDasharray: "",
              stroke: "#1f2937",
            },
          }}
          style={styles.chart}
        />
      )}

      {/* Kategori Pie Chart */}
      <Text style={styles.sectionTitle}>
        Kategorilere Göre Odaklanma Dağılımı
      </Text>
      {pieData.length > 0 && (
        <PieChart
          data={pieData}
          width={screenWidth - 32}
          height={230}
          chartConfig={{
            backgroundGradientFrom: "#020617",
            backgroundGradientTo: "#020617",
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(229, 231, 235, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="10"
          style={styles.chart}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    color: "#f9fafb",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 12,
  },
  cardSingle: {
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  cardValue: {
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  chart: {
    borderRadius: 12,
    marginBottom: 24,
  },
});
