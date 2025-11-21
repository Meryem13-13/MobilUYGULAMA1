// src/yardimci/depolama.js
import AsyncStorage from "@react-native-async-storage/async-storage";

// Sabit anahtarlar
const ANAHTAR_SEANSLAR = "odak_seanslari_v2";
const ANAHTAR_YILDIZ = "odak_yildizlar_v1";

// --------------------------- SEANS YÖNETİMİ ---------------------------

/** Yeni bir odak/ara seansını kaydeder. */
export async function seansKaydet(yeniSeans) {
  try {
    // Mevcut seans listesini al, yoksa boş bir dizi kullan.
    const seanslarJSON = await AsyncStorage.getItem(ANAHTAR_SEANSLAR);
    const mevcut = seanslarJSON ? JSON.parse(seanslarJSON) : [];
    
    // Yeni seansı listeye ekle.
    mevcut.push(yeniSeans);
    
    // Güncel listeyi geri kaydet.
    await AsyncStorage.setItem(ANAHTAR_SEANSLAR, JSON.stringify(mevcut));
  } catch (e) {
    console.log("Seans kaydedilemedi:", e);
  }
}

/** Kaydedilmiş tüm seansları döndürür. */
export async function seanslariGetir() {
  try {
    const seanslarJSON = await AsyncStorage.getItem(ANAHTAR_SEANSLAR);
    return seanslarJSON ? JSON.parse(seanslarJSON) : [];
  } catch (e) {
    console.log("Seanslar okunamadı:", e);
    return [];
  }
}

/** Tüm seans kayıtlarını siler. */
export async function seanslariTemizle() {
  try {
    await AsyncStorage.removeItem(ANAHTAR_SEANSLAR);
  } catch (e) {
    console.log("Seanslar temizlenemedi:", e);
  }
}

// --------------------------- YILDIZ YÖNETİMİ ---------------------------

/** Her başarılı odak seansında bir yıldız ekler. */
export async function yildizEkle(yildiz) {
  try {
    // Mevcut yıldız listesini al, yoksa boş bir dizi kullan.
    const yildizlarJSON = await AsyncStorage.getItem(ANAHTAR_YILDIZ);
    const mevcut = yildizlarJSON ? JSON.parse(yildizlarJSON) : [];
    
    // Yeni yıldızı listeye ekle.
    mevcut.push(yildiz);
    
    // Güncel listeyi geri kaydet.
    await AsyncStorage.setItem(ANAHTAR_YILDIZ, JSON.stringify(mevcut));
  } catch (e) {
    console.log("Yıldız eklenemedi:", e);
  }
}

/** Kaydedilmiş tüm yıldızları döndürür. */
export async function yildizlariGetir() {
  try {
    const yildizlarJSON = await AsyncStorage.getItem(ANAHTAR_YILDIZ);
    return yildizlarJSON ? JSON.parse(yildizlarJSON) : [];
  } catch (e) {
    console.log("Yıldızlar okunamadı:", e);
    return [];
  }
}

/** Tüm yıldız kayıtlarını siler. */
export async function yildizlariTemizle() {
  try {
    await AsyncStorage.removeItem(ANAHTAR_YILDIZ);
  } catch (e) {
    console.log("Yıldızlar temizlenemedi:", e);
  }
}