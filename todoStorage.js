import AsyncStorage from "@react-native-async-storage/async-storage";

const TODO_KEY = "@todos_list";

// ✔ Görevleri kaydet
export const saveTodos = async (todos) => {
  try {
    await AsyncStorage.setItem(TODO_KEY, JSON.stringify(todos));
  } catch (e) {
    console.log("Todo kaydedilemedi:", e);
  }
};

// ✔ Görevleri yükle
export const loadTodos = async () => {
  try {
    const data = await AsyncStorage.getItem(TODO_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log("Todo yüklenemedi:", e);
    return [];
  }
};
