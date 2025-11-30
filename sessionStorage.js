// src/storage/sessionStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@focus_sessions";

export const addSession = async (session) => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const sessions = json ? JSON.parse(json) : [];
    sessions.push(session);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("addSession error:", e);
  }
};

export const getAllSessions = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error("getAllSessions error:", e);
    return [];
  }
};
