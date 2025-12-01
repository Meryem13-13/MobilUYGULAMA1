// src/screens/TimerScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  Alert,
  SafeAreaView,
} from "react-native";

import { addSession, getAllSessions } from "../storage/sessionStorage";
import { loadSettings } from "../storage/settingsStorage";
import { loadCategories } from "../storage/categoryStorage";

export default function TimerScreen() {
  const [mode, setMode] = useState("focus"); // "focus" | "break"
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [focusDuration, setFocusDuration] = useState(1500); // saniye
  const [breakDuration, setBreakDuration] = useState(300); // saniye

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [distractionCount, setDistractionCount] = useState(0);

  const intervalRef = useRef(null);
  const appState = useRef(AppState.currentState);

  // ⭐ Uygulama açıldığında AYARLARI ve KATEGORİLERİ yükle
  useEffect(() => {
    const loadData = async () => {
      // Ayarlar
      const settings = await loadSettings();
      const focusMin = settings.focus;
      const breakMin = settings.breakTime;

      setFocusDuration(focusMin * 60);
      setBreakDuration(breakMin * 60);
      setTimeLeft(focusMin * 60);

      // Kategoriler
      const cats = await loadCategories();
      setCategories(cats);
      setSelectedCategory(cats[0]);
    };

    loadData();
  }, []);

  // ⭐ Dikkat Dağınıklığı Takibi (AppState)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (appState.current === "active" && nextState.match(/inactive|background/)) {
        if (isRunning && mode === "focus") {
          setIsRunning(false);
          setDistractionCount((prev) => prev + 1);
        }
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [isRunning, mode]);

  // ⭐ Zamanlayıcı Çalışma Mantığı
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleTimerFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  // ⭐ SÜRE BİTTİĞİNDE ÇALIŞAN KOD
  const handleTimerFinished = async () => {
    const durationMin =
      mode === "focus" ? focusDuration / 60 : breakDuration / 60;

    const session = {
      id: Date.now().toString(),
      type: mode,
      date: new Date().toISOString(),
      durationMinutes: durationMin,
      category: mode === "focus" ? selectedCategory : "Ara",
      distractions: mode === "focus" ? distractionCount : 0,
    };

    await addSession(session);

    if (mode === "focus") {
      Alert.alert(
        "Çalışma Bitti",
        "Tebrikler! Çalışma süren doldu. Şimdi otomatik mola başlıyor 🎉",
        [{ text: "Tamam" }]
      );

      setDistractionCount(0);

      setMode("break");
      setTimeLeft(breakDuration);
      setIsRunning(true);
    } else {
      Alert.alert(
        "Mola Bitti",
        "Molayı tamamladın! Tekrar çalışmaya geçebilirsin.",
        [{ text: "Tamam" }]
      );

      setMode("focus");
      setTimeLeft(focusDuration);
      setIsRunning(false);
      setDistractionCount(0);
    }
  };

  // ⭐ Butonlar
  const handleStart = () => {
    if (mode === "focus" && !selectedCategory) {
      Alert.alert("Kategori Seç", "Lütfen bir kategori seç.");
      return;
    }
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setDistractionCount(0);
    setMode("focus");
    setTimeLeft(focusDuration);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.modeText}>
          {mode === "focus" ? "Çalışma Modu" : "Mola Modu"}
        </Text>

        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>

        {/* ⭐ Kategori Seçimi */}
        {mode === "focus" && (
          <View style={styles.categoryContainer}>
            <Text style={styles.sectionTitle}>Kategori Seç</Text>
            <View style={styles.categoryRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ⭐ Dikkat Dağınıklığı */}
        <Text style={styles.distractionText}>
          Dikkat Dağınıklığı: {distractionCount}
        </Text>

        {/* ⭐ Butonlar */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>Başlat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.pauseButton]}
            onPress={handlePause}
          >
            <Text style={styles.buttonText}>Duraklat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>Sıfırla</Text>
          </TouchableOpacity>
        </View>

        {/* ⭐ Seans Özeti */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Seans Özeti</Text>
          <Text style={styles.summaryText}>
            Mod: {mode === "focus" ? "Çalışma" : "Mola"}
          </Text>
          <Text style={styles.summaryText}>
            Kategori: {mode === "focus" ? selectedCategory : "Ara"}
          </Text>
          <Text style={styles.summaryText}>
            Dikkat Dağınıklığı: {distractionCount}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 🖌 Tasarımlar
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  modeText: {
    marginTop: 16,
    fontSize: 20,
    color: "#e5e7eb",
    textAlign: "center",
  },
  timerText: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#f9fafb",
    textAlign: "center",
    marginVertical: 20,
  },
  categoryContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4b5563",
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  categoryText: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  categoryTextActive: {
    color: "#020617",
    fontWeight: "bold",
  },
  distractionText: {
    marginTop: 16,
    color: "#f97316",
    fontSize: 16,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#22c55e",
  },
  pauseButton: {
    backgroundColor: "#facc15",
  },
  resetButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#020617",
    fontWeight: "bold",
    fontSize: 16,
  },
  summaryBox: {
    marginTop: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#0f172a",
  },
  summaryTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "bold",
  },
  summaryText: {
    color: "#9ca3af",
    fontSize: 14,
  },
});
