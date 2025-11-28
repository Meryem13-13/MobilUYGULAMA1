// src/Ekranlar/AnaEkran.js
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    AppState,
    Button,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { Audio } from "expo-av";

import { KATEGORILER } from "../veri/Kategoriler";
import { seansKaydet, yildizEkle } from "../yardimci/depolama";

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

  const focusSound = useRef(new Audio.Sound());
  const breakSound = useRef(new Audio.Sound());

  // SESLERİ YÜKLE
  useEffect(() => {
    (async () => {
      try {
        await focusSound.current.loadAsync(
          require("../../assets/sounds/focus_end.mp3")
        );
        await breakSound.current.loadAsync(
          require("../../assets/sounds/break_end.mp3")
        );
      } catch (e) {
        console.log("Ses yükleme hatası:", e);
      }
    })();

    return () => {
      focusSound.current.unloadAsync();
      breakSound.current.unloadAsync();
    };
  }, []);

  // ZAMANLAYICI
  useEffect(() => {
    if (!calisiyor) return;

    intervalRef.current = setInterval(() => {
      setKalanSaniye((onceki) => {
        if (onceki <= 1) {
          clearInterval(intervalRef.current);
          setCalisiyor(false);

          setTimeout(() => {
            handlePeriodEnd();
          }, 0);

          return 0;
        }
        return onceki - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [calisiyor]);

  // DİKKAT DAĞINIKLIĞI TAKİBİ
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (
        appStateRef.current === "active" &&
        nextState.match(/inactive|background/)
      ) {
        if (calisiyor) {
          setDikkat((d) => d + 1);
          setCalisiyor(false);
          Alert.alert("Uyarı", "Uygulamadan çıktın. Seans duraklatıldı.");
        }
      }
      appStateRef.current = nextState;
    });

    return () => sub.remove();
  }, [calisiyor]);

  // PERİYOT BİTİNCE
  async function handlePeriodEnd() {
    const periyotSure = (isBreak ? breakDakika : focusDakika) * 60;

    try {
      await seansKaydet({
        id: Date.now(),
        kategori: isBreak ? "Ara" : kategori,
        dikkat: isBreak ? 0 : dikkat,
        sure: periyotSure,
        baslangic: new Date(Date.now() - periyotSure * 1000).toISOString(),
        bitis: new Date().toISOString(),
        tip: isBreak ? "ara" : "odak",
      });

      if (!isBreak) {
        await focusSound.current.replayAsync();

        await yildizEkle({
          id: Date.now(),
          zaman: new Date().toISOString(),
          kategori,
        });

        Alert.alert(
          "Odak Bitti",
          `Süre: ${focusDakika} dk\nDikkat: ${dikkat}\nAra başlıyor`
        );
      } else {
        await breakSound.current.replayAsync();
        Alert.alert("Ara Bitti", "Yeni odak başladı");
      }

      const yeniIsBreak = !isBreak;
      setIsBreak(yeniIsBreak);
      setDikkat(0);
      setKalanSaniye((yeniIsBreak ? breakDakika : focusDakika) * 60);
      setCalisiyor(true);
    } catch (e) {
      console.log("Hata:", e);
    }
  }

  function baslat() {
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
  }

  const dakika = Math.floor(kalanSaniye / 60);
  const saniye = String(kalanSaniye % 60).padStart(2, "0");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⏳ Odaklanma Zamanlayıcısı</Text>

      <View style={styles.timerBox}>
        <Text style={styles.timerText}>
          {dakika}:{saniye}
        </Text>
        <Text style={styles.subText}>
          {isBreak ? "Ara Zamanı" : "Odak Zamanı"}
        </Text>
      </View>

      {/* Süre Ayarları */}
      <View style={styles.row}>
        <View style={styles.stepper}>
          <Text>Odak (dk)</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setFocusDakika((d) => Math.max(1, d - 1))}
            >
              <Text>-</Text>
            </TouchableOpacity>

            <Text style={styles.stepText}>{focusDakika}</Text>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setFocusDakika((d) => Math.min(180, d + 1))}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stepper}>
          <Text>Ara (dk)</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setBreakDakika((d) => Math.max(1, d - 1))}
            >
              <Text>-</Text>
            </TouchableOpacity>

            <Text style={styles.stepText}>{breakDakika}</Text>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setBreakDakika((d) => Math.min(60, d + 1))}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Kategori */}
      <View style={styles.pickerBox}>
        <Text style={{ marginBottom: 5 }}>Kategori</Text>
        <Picker
          selectedValue={kategori}
          onValueChange={(v) => setKategori(v)}
          style={{ backgroundColor: "#fff" }}
        >
          {KATEGORILER.map((k) => (
            <Picker.Item
              key={k.deger}
              label={k.etiket}
              value={k.deger}
            />
          ))}
        </Picker>
      </View>

      <Text style={{ marginTop: 8 }}>Dikkat Dağınıklığı: {dikkat}</Text>

      {/* Kontroller */}
      <View style={styles.controls}>
        <Button
          title={calisiyor ? "Duraklat" : "Başlat"}
          onPress={calisiyor ? duraklat : baslat}
        />

        <Button title="Sıfırla" onPress={sifirla} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  timerBox: {
    alignItems: "center",
    marginVertical: 12,
  },
  timerText: {
    fontSize: 56,
    fontWeight: "800",
    color: "#0b1220",
  },
  subText: {
    color: "#6b7280",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 10,
  },
  stepper: {
    alignItems: "center",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  stepBtn: {
    padding: 8,
    backgroundColor: "#e6e6e6",
    borderRadius: 6,
  },
  stepText: {
    paddingHorizontal: 12,
    fontSize: 16,
  },
  pickerBox: {
    width: "80%",
    marginTop: 10,
  },
  controls: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    width: "60%",
    justifyContent: "space-between",
  },
});
