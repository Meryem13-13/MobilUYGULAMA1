// src/storage/userQuotes.js

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "USER_QUOTES";

// Kullanıcı yeni söz ekler → storage'a kaydedilir
export const addUserQuote = async (quote) => {
  try {
    const existing = await getUserQuotes();
    const updated = [...existing, quote];
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch (e) {
    console.log("Söz ekleme hatası:", e);
  }
};

// Kaydedilmiş sözleri getir
export const getUserQuotes = async () => {
  try {
    const saved = await AsyncStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.log("Söz yükleme hatası:", e);
    return [];
  }
};
