import AsyncStorage from "@react-native-async-storage/async-storage";

const CATEGORY_KEY = "CATEGORIES";

// ---------------------------------------------------
//  Tüm kategorileri yükle
// ---------------------------------------------------
export async function loadCategories() {
  try {
    const json = await AsyncStorage.getItem(CATEGORY_KEY);

    // Eğer veri yoksa boş liste döndür
    if (!json) return [];

    const parsed = JSON.parse(json);

    // Güvenlik: Veri array değilse sıfırla
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch (err) {
    console.log("Kategori yükleme hatası:", err);
    return [];
  }
}

// ---------------------------------------------------
//   Yeni kategori ekle (aynısı varsa ekleme)
// ---------------------------------------------------
export async function saveCategory(name) {
  try {
    const categories = await loadCategories();
    const newName = name.trim();

    if (!newName) {
      return { success: false, message: "Boş kategori eklenemez" };
    }

    // Aynı kategori var mı?
    const exists = categories.some(
      (cat) => cat.trim().toLowerCase() === newName.toLowerCase()
    );

    if (exists) {
      return { success: false, message: "Kategori zaten mevcut" };
    }

    // Yeni kategoriyi ekle
    const updated = [...categories, newName];
    await AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify(updated));

    return { success: true };
  } catch (err) {
    console.log("Kategori kaydetme hatası:", err);
    return { success: false };
  }
}
