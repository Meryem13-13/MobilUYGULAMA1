import AsyncStorage from "@react-native-async-storage/async-storage";

const COMPLETED_KEY = "@completed_todos";

// ✔ Bugün tamamlanan görevi kaydet
export const saveCompletedTodo = async (todo) => {
  try {
    const stored = await AsyncStorage.getItem(COMPLETED_KEY);
    const list = stored ? JSON.parse(stored) : [];

    list.push({
      ...todo,
      date: new Date().toISOString().slice(0, 10), // sadece YYYY-MM-DD
    });

    await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(list));
  } catch (e) {
    console.log("Tamamlanan görev kaydedilemedi:", e);
  }
};

// ✔ Tamamlanan görevleri getir
export const loadCompletedTodos = async () => {
  try {
    const stored = await AsyncStorage.getItem(COMPLETED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.log("Tamamlanan görevler yüklenemedi:", e);
    return [];
  }
};
