// src/Ekranlar/AnaEkran.js
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button, AppState, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { seansKaydet, yildizEkle } from "../yardimci/depolama";
import { KATEGORILER } from "../veri/Kategoriler";
import { Audio } from "expo-av";

export default function AnaEkran() {
  const DEFAULT_FOCUS = 25;
  const DEFAULT_BREAK = 5;

  const [focusDakika, setFocusDakika] = useState(DEFAULT_FOCUS);
  const [breakDakika, setBreakDakika] = useState(DEFAULT_BREAK);

  const [kalanSaniye, setKalanSaniye] = useState(DEFAULT_FOCUS * 60);
  const [calisiyor, setCalisiyor] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const [dikkat, setDikkat] = useState(0);
  const [kategori, setKategori] = useState(KATEGORILER[0].deger);

  const intervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const seansBaslangicRef = useRef(null);

  const focusSound = useRef(new Audio.Sound());
  const breakSound = useRef(new Audio.Sound());

  // ses dosyalarını yükle
  useEffect(() => {
    (async () => {
      try {
        await focusSound.current.loadAsync(require("../../assets/sounds/focus_end.mp3"));
      } catch (e) { console.log("focus sound load error", e); }
      try {
        await breakSound.current.loadAsync(require("../../assets/sounds/break_end.mp3"));
      } catch (e) { console.log("break sound load error", e); }
    })();

    return () => {
      focusSound.current.unloadAsync();
      breakSound.current.unloadAsync();
    };
  }, []);

  // TIMER MANTIĞI
  useEffect(() => {
    if (calisiyor) {
      intervalRef.current = setInterval(() => {
        setKalanSaniye((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setCalisiyor(false); // Bitişte zamanlayıcıyı durdurur
            handlePeriodEnd(); // Bitiş ve geçiş mantığını çalıştırır
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [calisiyor]);

  // DİKKAT DAĞINIKLIĞI (Uygulama arka plana geçtiğinde)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (appStateRef.current === "active" && next.match(/inactive|background/)) {
        if (calisiyor) {
          setDikkat((d) => d + 1);
          setCalisiyor(false);
          Alert.alert("Seans duraklatıldı", "Uygulamadan ayrıldınız, seans duraklatıldı.");
        }
      }
      appStateRef.current = next;
    });

    return () => sub.remove();
  }, [calisiyor]);

  // PERİYOT BİTİŞİ VE GEÇİŞ MANTIĞI
  async function handlePeriodEnd() {
    try {
      const now = new Date();
        
      // Geçen süreyi hesapla (Odak veya Ara için)
      const bas = seansBaslangicRef.current || new Date(now.getTime() - (isBreak ? breakDakika : focusDakika) * 60000);
      const sure = Math.round((now - bas) / 1000);

      // 1. Kayıt İşlemi (Hem Odak hem Ara için çalışır)
      await seansKaydet({
        id: Date.now(),
        kategori: isBreak ? "ara" : kategori, 
        dikkat: isBreak ? 0 : dikkat, // Ara seansında dikkat 0
        sure,
        baslangic: bas.toISOString(),
        bitis: now.toISOString(),
        tip: isBreak ? "ara" : "odak", // Seans tipini doğru kaydet
      });

      // 2. Odak Bitişi İşlemleri
      if (!isBreak) {
        await focusSound.current.replayAsync();
        // Sadece odak bittiğinde yıldız ekle
        await yildizEkle({ id: Date.now(), zaman: now.toISOString(), kategori }); 

        Alert.alert(
          "Odak Bitti",
          `Süre: ${Math.round(sure / 60)} dk\nDikkat: ${dikkat}\nŞimdi Ara Başlıyor...`
        );
      } 
      // 3. Ara Bitişi İşlemleri
      else { 
        await breakSound.current.replayAsync();
        Alert.alert("Ara Bitti", "Ara süresi tamamlandı. Şimdi Yeni Odak Başlıyor...");
      }

      // 4. Durum Geçişi ve Yeniden Başlatma
      const yeniMod = !isBreak; // Odak ise Ara'ya, Ara ise Odak'a geç
      setIsBreak(yeniMod);

      // Doğru kalan süreyi ayarla
      if (yeniMod === true) {
        // Ara başlıyor
        setKalanSaniye(breakDakika * 60);
      } else {
        // Odak başlıyor
        setKalanSaniye(focusDakika * 60);
      }

      // Resetler
      setDikkat(0);
      seansBaslangicRef.current = null;
      
      // 🔥 OTOMATİK BAŞLATMAYI GARANTİ ETMEK İÇİN setTimeout kullanılır
      setTimeout(() => {
        setCalisiyor(true);
      }, 100); 
      
    } catch (e) {
      console.log("handlePeriodEnd error:", e);
    }
  }

  function baslat() {
    // Başlatıldığında başlangıç zamanını kaydetmeyi garanti et
    if (!calisiyor) {
        seansBaslangicRef.current = new Date();
    }
    setCalisiyor(true);
  }
  function duraklat() {
    setCalisiyor(false);
  }
  function sifirla() {
    setCalisiyor(false);
    setIsBreak(false);
    setKalanSaniye(focusDakika * 60);
    setDikkat(0);
    seansBaslangicRef.current = null;
  }

  const dakika = Math.floor(kalanSaniye / 60);
  const saniye = String(kalanSaniye % 60).padStart(2, "0");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaklanma Zamanlayıcısı</Text>

      <View style={styles.timerBox}>
        <Text style={styles.timerText}>{dakika}:{saniye}</Text>
        <Text style={{ color: "#6b7280" }}>
          {isBreak ? "Ara zamanı" : "Odak zamanı"}
        </Text>
      </View>

      {/* Süre Ayarı */}
      <View style={styles.row}>
        <View style={styles.stepper}>
          <Text>Odak (dk)</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity onPress={() => setFocusDakika((d) => Math.max(5, d - 1))} style={styles.stepBtn}><Text>-</Text></TouchableOpacity>
            <Text style={{ paddingHorizontal: 12 }}>{focusDakika}</Text>
            <TouchableOpacity onPress={() => setFocusDakika((d) => Math.min(180, d + 1))} style={styles.stepBtn}><Text>+</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.stepper}>
          <Text>Ara (dk)</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity onPress={() => setBreakDakika((d) => Math.max(1, d - 1))} style={styles.stepBtn}><Text>-</Text></TouchableOpacity>
            <Text style={{ paddingHorizontal: 12 }}>{breakDakika}</Text>
            <TouchableOpacity onPress={() => setBreakDakika((d) => Math.min(60, d + 1))} style={styles.stepBtn}><Text>+</Text></TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Kategori */}
      <View style={{ width: "80%", marginTop: 10 }}>
        <Text style={{ marginBottom: 6 }}>Kategori</Text>
        <Picker selectedValue={kategori} onValueChange={(v) => setKategori(v)}>
          {KATEGORILER.map(k => <Picker.Item key={k.deger} label={k.etiket} value={k.deger} />)}
        </Picker>
      </View>

      <Text style={{ marginTop: 8 }}>Dikkat Dağınıklığı: {dikkat}</Text>

      <View style={styles.controls}>
        <Button title={calisiyor ? "Duraklat" : "Başlat"} onPress={() => (calisiyor ? duraklat() : baslat())} />
        <Button title="Sıfırla" onPress={sifirla} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 16, backgroundColor: "#f8fafc" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  timerBox: { alignItems: "center", marginVertical: 12 },
  timerText: { fontSize: 56, fontWeight: "800", color: "#0b1220" },
  row: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 8 },
  stepper: { alignItems: "center" },
  stepperRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  stepBtn: { padding: 8, backgroundColor: "#e6e6e6", borderRadius: 6 },
  controls: { flexDirection: "row", gap: 12, marginTop: 18, width: "60%", justifyContent: "space-between" },
});