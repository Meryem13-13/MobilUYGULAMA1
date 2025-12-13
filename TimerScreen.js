// src/screens/TimerScreen.js

import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
  AppState,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { loadCategories } from "../storage/categoryStorage";
import { addSession, getAllSessions } from "../storage/sessionStorage";
import { loadSettings } from "../storage/settingsStorage";
import { ThemeContext } from "../theme/ThemeContext";

import AnimatedSky from "../components/AnimatedSky";
import AvatarView from "../components/AvatarView";
import MoodSelector from "../components/MoodSelector";
import { MOOD_CONFIG } from "../mood/moodConfig";

import DropDownPicker from "react-native-dropdown-picker";


export default function TimerScreen() {
  const { theme } = useContext(ThemeContext);

  // TIMER STATES
  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [focusDuration, setFocusDuration] = useState(1500);
  const [breakDuration, setBreakDuration] = useState(300);

  // CATEGORY DROPDOWN
  const [categoryItems, setCategoryItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openCategory, setOpenCategory] = useState(false);

  // OTHERS
  const [distractionCount, setDistractionCount] = useState(0);
  const [starCount, setStarCount] = useState(0);
  const [mood, setMood] = useState("focused");

  // MOTIVATION
  const [dailyQuote, setDailyQuote] = useState(null);

  // TODO LIST
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // PAGE REFRESH
  const [refreshing, setRefreshing] = useState(false);

  const intervalRef = useRef(null);
  const appState = useRef(AppState.currentState);


  /* ---------------------------------------------------------------------- */
  /*                               SAYFA YENİLEME                           */
  /* ---------------------------------------------------------------------- */

  const onRefresh = async () => {
    setRefreshing(true);
    await reloadData();
    setRefreshing(false);
  };

  const reloadData = async () => {
    try {
      const settings = await loadSettings();
      setFocusDuration(settings.focus * 60);
      setBreakDuration(settings.breakTime * 60);

      setTimeLeft(settings.focus * 60);

      fetchDailyQuote();

      const cats = await loadCategories();
      setCategoryItems(cats.map((c) => ({ label: c, value: c })));

      if (!selectedCategory) {
        setSelectedCategory(cats[0]);
      }
    } catch (e) {
      console.log("Yenileme hatası:", e);
    }
  };


  /* ---------------------------------------------------------------------- */
  /*                                 INIT LOAD                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const init = async () => {
      const settings = await loadSettings();
      const cats = await loadCategories();
      const sessions = await getAllSessions();

      // timer süreleri
      setFocusDuration(settings.focus * 60);
      setBreakDuration(settings.breakTime * 60);
      setTimeLeft(settings.focus * 60);

      // kategori dropdown
      setCategoryItems(cats.map((c) => ({ label: c, value: c })));
      setSelectedCategory(cats[0]);

      // yıldızlar
      setStarCount(sessions.filter((s) => s.type === "focus").length);

      // motivasyon sözü getir
      fetchDailyQuote();
    };

    init();
  }, []);


  /* ---------------------------------------------------------------------- */
  /*                             MOTIVATION API                              */
  /* ---------------------------------------------------------------------- */

  const fetchDailyQuote = async () => {
    try {
      const res = await fetch("https://api.adviceslip.com/advice");
      const data = await res.json();

      setDailyQuote({
        text: data.slip.advice,
        author: "Günlük Tavsiye",
      });
    } catch (err) {
      console.log("API Hatası:", err);
    }
  };


  /* ---------------------------------------------------------------------- */
  /*                      ARKA PLANA GİDİNCE DAĞINIKLIK                      */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current === "active" && next !== "active") {
        if (isRunning && mode === "focus") {
          setIsRunning(false);
          setDistractionCount((p) => p + 1);
        }
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, [isRunning, mode]);


  /* ---------------------------------------------------------------------- */
  /*                                 TIMER                                   */
  /* ---------------------------------------------------------------------- */

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
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);


  /* ---------------------------------------------------------------------- */
  /*                             TIMER FINISHED                              */
  /* ---------------------------------------------------------------------- */

  const handleTimerFinished = async () => {
    await addSession({
      id: Date.now().toString(),
      type: mode,
      date: new Date().toISOString(),
      durationMinutes:
        mode === "focus" ? focusDuration / 60 : breakDuration / 60,
      category: selectedCategory,
      distractions: distractionCount,
    });

    if (mode === "focus") {
      Alert.alert("Çalışma Bitti 🎉", "Şimdi mola zamanı!");
      setStarCount((p) => p + 1);
      setMode("break");
      setTimeLeft(breakDuration);
      setIsRunning(true);
      setDistractionCount(0);
    } else {
      Alert.alert("Mola Bitti", "Tekrar çalışalım 💪");
      setMode("focus");
      setTimeLeft(focusDuration);
      setIsRunning(false);
      setDistractionCount(0);
    }
  };


  /* ---------------------------------------------------------------------- */
  /*                               BUTTONS                                   */
  /* ---------------------------------------------------------------------- */

  const handleStart = () => {
    if (!selectedCategory && mode === "focus") {
      return Alert.alert("Kategori Seç", "Lütfen bir kategori seçiniz.");
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


  /* ---------------------------------------------------------------------- */
  /*                              TIME FORMAT                                */
  /* ---------------------------------------------------------------------- */

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(
      2,
      "0"
    )}`;

  const currentMoodConfig = MOOD_CONFIG[mood];


  /* ---------------------------------------------------------------------- */
  /*                                 RENDER                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* SKY */}
        <View style={{ height: 120 }}>
          <AnimatedSky moodColor={currentMoodConfig.bgColor} />
        </View>

        <AvatarView starCount={starCount} theme={theme} />
        <MoodSelector currentMood={mood} onChange={setMood} theme={theme} />

        {/* MOTIVATION QUOTE */}
        {dailyQuote && (
          <View style={[styles.quoteBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.quoteText, { color: theme.textPrimary }]}>
              "{dailyQuote.text}"
            </Text>
            <Text style={[styles.quoteAuthor, { color: theme.textSecondary }]}>
              — {dailyQuote.author}
            </Text>

            <TouchableOpacity
              style={[styles.newQuoteBtn, { backgroundColor: theme.accent }]}
              onPress={fetchDailyQuote}
            >
              <Text style={{ color: "#fff" }}>Yeni Söz Getir</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MOOD MESSAGE */}
        <View style={[styles.moodBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.moodText, { color: theme.textPrimary }]}>
            {currentMoodConfig.message}
          </Text>
        </View>

        {/* TIMER */}
        <Text style={[styles.modeText, { color: theme.textTitle }]}>
          {mode === "focus" ? "Çalışma Modu" : "Mola Modu"}
        </Text>

        <Text style={[styles.timerText, { color: theme.textPrimary }]}>
          {formatTime(timeLeft)}
        </Text>

        {/* CATEGORY DROPDOWN */}
        {mode === "focus" && (
          <View style={{ zIndex: 1000, marginBottom: openCategory ? 150 : 20 }}>
            <Text style={[styles.sectionTitle, { color: theme.textTitle }]}>
              Kategori Seç
            </Text>

            <DropDownPicker
              open={openCategory}
              value={selectedCategory}
              items={categoryItems}
              setOpen={setOpenCategory}
              setValue={setSelectedCategory}
              setItems={setCategoryItems}
              placeholder="Kategori seçin..."
              style={{
                backgroundColor: theme.card,
                borderColor: theme.accent,
              }}
              dropDownContainerStyle={{
                backgroundColor: theme.card,
                borderColor: theme.accent,
              }}
              textStyle={{ color: theme.textPrimary }}
              placeholderStyle={{ color: theme.textSecondary }}
              disabled={isRunning}
            />
          </View>
        )}

        {/* DISTRACTION COUNT */}
        <Text style={[styles.distractionText, { color: theme.textPrimary }]}>
          Dikkat Dağınıklığı: {distractionCount}
        </Text>

        {/* TODO LIST */}
        <View style={[styles.todoBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.todoTitle, { color: theme.textTitle }]}>
            Günlük Yapılacaklar
          </Text>

          <View style={styles.todoInputRow}>
            <TextInput
              style={[
                styles.todoInput,
                { color: theme.textPrimary, borderColor: theme.accent },
              ]}
              placeholder="Görev ekle..."
              placeholderTextColor={theme.textSecondary}
              value={newTodo}
              onChangeText={setNewTodo}
            />
            <TouchableOpacity
              style={[styles.todoAddBtn, { backgroundColor: theme.accent }]}
              onPress={() => {
                if (newTodo.trim()) {
                  setTodos([...todos, { id: Date.now(), text: newTodo, done: false }]);
                  setNewTodo("");
                }
              }}
            >
              <Text style={{ color: "#fff" }}>Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* TODO LIST DISPLAY */}
          {todos.length === 0 ? (
            <Text style={[styles.emptyTodoText, { color: theme.textSecondary }]}>
              Henüz görev yok
            </Text>
          ) : (
            todos.map((item) => (
              <View key={item.id} style={styles.todoItem}>
                <TouchableOpacity
                  style={styles.todoCheck}
                  onPress={() =>
                    setTodos(
                      todos.map((t) =>
                        t.id === item.id ? { ...t, done: !t.done } : t
                      )
                    )
                  }
                >
                  <Text style={{ color: theme.accent }}>
                    {item.done ? "✓" : "○"}
                  </Text>
                </TouchableOpacity>

                <Text
                  style={[
                    styles.todoText,
                    {
                      color: theme.textPrimary,
                      textDecorationLine: item.done ? "line-through" : "none",
                    },
                  ]}
                >
                  {item.text}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setTodos(todos.filter((t) => t.id !== item.id))
                  }
                >
                  <Text style={[styles.todoDelete, { color: "#ff4d4d" }]}>
                    Sil
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.buttonStart }]}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>Başlat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.buttonPause }]}
            onPress={handlePause}
          >
            <Text style={styles.buttonText}>Duraklat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.buttonReset }]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>Sıfırla</Text>
          </TouchableOpacity>
        </View>

        {/* SUMMARY */}
        <View style={[styles.summaryBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.summaryTitle, { color: theme.textTitle }]}>
            Seans Özeti
          </Text>

          <Text style={[styles.summaryText, { color: theme.textPrimary }]}>
            Mod: {mode === "focus" ? "Çalışma" : "Mola"}
          </Text>

          <Text style={[styles.summaryText, { color: theme.textPrimary }]}>
            Kategori: {selectedCategory}
          </Text>

          <Text style={[styles.summaryText, { color: theme.textPrimary }]}>
            Dikkat Dağınıklığı: {distractionCount}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}



/* ---------------------------------------------------------------------- */
/*                                STYLES                                   */
/* ---------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },

  scroll: {
    padding: 16,
    paddingBottom: 120,
  },

  quoteBox: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: "center",
  },
  quoteText: { fontSize: 16, fontStyle: "italic", textAlign: "center" },
  quoteAuthor: { fontSize: 14, marginTop: 6 },
  newQuoteBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  moodBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  moodText: { fontSize: 14 },

  modeText: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 8,
  },

  timerText: {
    fontSize: 68,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
  },

  sectionTitle: {
    fontSize: 16,
    marginBottom: 6,
  },

  distractionText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 10,
  },

  /* TODOS */
  todoBox: {
    padding: 14,
    borderRadius: 12,
    marginVertical: 20,
  },
  todoTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 10 },

  todoInputRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  todoInput: {
    flex: 1,
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  todoAddBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  emptyTodoText: {
    textAlign: "center",
    marginTop: 6,
  },

  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  todoCheck: {
    width: 30,
    alignItems: "center",
  },
  todoText: {
    flex: 1,
    fontSize: 15,
  },
  todoDelete: { marginLeft: 10, fontWeight: "bold" },

  /* BUTTONS */
  buttonRow: {
    flexDirection: "row",
    marginTop: 18,
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  summaryBox: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
  },
});
