import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTES_KEY = "DAILY_NOTES";

export const saveNotes = async (text) => {
  try {
    await AsyncStorage.setItem(NOTES_KEY, text);
  } catch (err) {
    console.log("Not kaydedilemedi:", err);
  }
};

export const loadNotes = async () => {
  try {
    const saved = await AsyncStorage.getItem(NOTES_KEY);
    return saved || "";
  } catch (err) {
    console.log("Not yüklenemedi:", err);
    return "";
  }
};
