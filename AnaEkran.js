import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button, AppState, Alert, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { seansKaydet } from "../yardimci/depolama";
import { KATEGORILER } from "../veri/Kategoriler";

export default function AnaEkran() {
  const BASLANGIC_DK = 25;

  const [kalanSaniye, setKalanSaniye] = useState(BASLANGIC_DK * 60);
  const [calisiyor, setCalisiyor] = useState(false);
  const [dikkat, setDikkat] = useState(0);
  const [kategori, setKategori] = useState("Kodlama");

  const intervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const seansBaslangic = useRef(null);

  useEffect(() => {
    if (calisiyor) {
      intervalRef.current = setInterval(() => {
        setKalanSaniye((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setCalisiyor(false);
            bitirSeans();
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

  useEffect(() => {
    const dinleyici = AppState.addEventListener("change", (yeni) => {
      if (appStateRef.current === "active" && yeni !== "active") {
        if (calisiyor) {
          setDikkat((x) => x + 1);
          setCalisiyor(false);
        }
      }
      appStateRef.current = yeni;
    });

    return () => dinleyici.remove();
  }, [calisiyor]);

  function baslat() {
    seansBaslangic.current = new Date();
    setCalisiyor(true);
  }

  function duraklat() {
    setCalisiyor(false);
  }

  function sifirla() {
    setCalisiyor(false);
    setKalanSaniye(BASLANGIC_DK * 60);
    setDikkat(0);
  }

  async function bitirSeans() {
    const bitis = new Date();
    const baslangic =
      seansBaslangic.current ||
      new Date(bitis.getTime() - (BASLANGIC_DK * 60 - kalanSaniye) * 1000);

    const sureSaniye = Math.round((bitis - baslangic) / 1000);

    const seans = {
      id: Date.now(),
      kategori,
      dikkat,
      sure: sureSaniye,
      baslangic: baslangic.toISOString(),
      bitis: bitis.toISOString(),
    };

    await seansKaydet(seans);

    Alert.alert(
      "Seans Bitti",
      `Süre: ${Math.round(sureSaniye / 60)} dk\nDikkat Dağınıklığı: ${dikkat}`
    );

    sifirla();
  }

  const dk = Math.floor(kalanSaniye / 60);
  const sn = kalanSaniye % 60;

  return (
    <View style={s.ekran}>
      <Text style={s.sayac}>{dk}:{String(sn).padStart(2, "0")}</Text>

      <Text style={s.etiket}>Kategori</Text>
      <Picker
        selectedValue={kategori}
        style={{ width: "80%" }}
        onValueChange={(v) => setKategori(v)}
      >
        {KATEGORILER.map((k) => (
          <Picker.Item key={k.deger} label={k.etiket} value={k.deger} />
        ))}
      </Picker>

      <Text style={{ marginTop: 10 }}>Dikkat Dağınıklığı: {dikkat}</Text>

      <View style={s.satir}>
        <Button title={calisiyor ? "Duraklat" : "Başlat"} onPress={() => (calisiyor ? duraklat() : baslat())} />
        <Button title="Sıfırla" onPress={sifirla} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  ekran: { flex: 1, justifyContent: "center", alignItems: "center" },
  sayac: { fontSize: 48, fontWeight: "bold", marginBottom: 12 },
  etiket: { marginBottom: 4 },
  satir: { flexDirection: "row", gap: 12, marginTop: 20 },
});
