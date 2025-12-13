import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { ThemeContext } from "../theme/ThemeContext";
import { loadSettings, saveSettings } from "../storage/settingsStorage";
import { loadCategories, saveCategory } from "../storage/categoryStorage";

export default function SettingsScreen() {
  const { theme, changeTheme } = useContext(ThemeContext);

  const [focusTime, setFocusTime] = useState("25");
  const [breakTime, setBreakTime] = useState("5");

  const [newCategory, setNewCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    const loadAll = async () => {
      const settings = await loadSettings();
      const categories = await loadCategories();

      setFocusTime(settings.focus.toString());
      setBreakTime(settings.breakTime.toString());
      setCategoryList(categories);
    };

    loadAll();
  }, []);

  // 🔹 Ayarları kaydetme
  const saveAll = async () => {
    await saveSettings({
      focus: Number(focusTime),
      breakTime: Number(breakTime),
    });

    alert("Ayarlar kaydedildi ✔");
  };

  // 🔹 Kategori ekleme
  const addNewCategory = async () => {
    if (!newCategory.trim()) return alert("Kategori adı boş olamaz!");

    await saveCategory(newCategory);

    const updated = await loadCategories();
    setCategoryList(updated);

    setNewCategory("");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.title, { color: theme.textTitle }]}>
        Ayarlar
      </Text>

      {/* 🔹 Çalışma süresi */}
      <Text style={[styles.label, { color: theme.textPrimary }]}>
        Çalışma Süresi (dk)
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            borderColor: theme.accent,
            color: theme.textPrimary,
          },
        ]}
        value={focusTime}
        onChangeText={setFocusTime}
        keyboardType="numeric"
      />

      {/* 🔹 Mola süresi */}
      <Text style={[styles.label, { color: theme.textPrimary }]}>
        Mola Süresi (dk)
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            borderColor: theme.accent,
            color: theme.textPrimary,
          },
        ]}
        value={breakTime}
        onChangeText={setBreakTime}
        keyboardType="numeric"
      />

      {/* 🔹 Ayarları kaydet butonu */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: theme.buttonStart },
        ]}
        onPress={saveAll}
      >
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>

      {/* 🔹 Kategori ekleme alanı */}
      <Text
        style={[
          styles.subtitle,
          { color: theme.textTitle, marginTop: 25 },
        ]}
      >
        Yeni Kategori Ekle
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            borderColor: theme.accent,
            color: theme.textPrimary,
          },
        ]}
        placeholder="Kategori adı..."
        placeholderTextColor={theme.textPrimary}
        value={newCategory}
        onChangeText={setNewCategory}
      />

      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: theme.accent },
        ]}
        onPress={addNewCategory}
      >
        <Text style={styles.buttonText}>Kategori Ekle</Text>
      </TouchableOpacity>

      {/* 🔹 Mevcut kategoriler */}
      <Text style={[styles.label, { color: theme.textPrimary, marginTop: 20 }]}>
        Mevcut Kategoriler:
      </Text>

      {categoryList.map((cat, index) => (
        <Text
          key={index}
          style={[styles.categoryItem, { color: theme.textPrimary }]}
        >
          • {cat}
        </Text>
      ))}

      {/* ⭐ TEMA SEÇME */}
      <Text
        style={[
          styles.subtitle,
          { color: theme.textTitle, marginTop: 35 },
        ]}
      >
        Tema Seç
      </Text>

      <View style={styles.themeList}>
        {["pastel", "dark", "neon", "minimal", "sunshine"].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => changeTheme(t)}
            style={[
              styles.themeButton,
              {
                backgroundColor:
                  theme.name === t ? theme.accent : theme.card,
                borderColor: theme.accent,
              },
            ]}
          >
            <Text
              style={[
                styles.themeButtonText,
                {
                  color:
                    theme.name === t ? "white" : theme.textPrimary,
                },
              ]}
            >
              {t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },

  label: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 16,
  },

  subtitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  saveButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },

  addButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  categoryItem: {
    fontSize: 16,
    marginTop: 4,
  },

  themeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },

  themeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 6,
    marginVertical: 6,
  },

  themeButtonText: {
    fontWeight: "bold",
  },
});
