import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button, AppState, Alert, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { seansKaydet } from "../yardimci/depolama";

<text>meryen</text>

export default function AnaEkran() {
  const BASLANGIC_DAKIKA = 25;

  const [kalanSaniye, setKalanSaniye] = useState(BASLANGIC_DAKIKA * 60);
  const [calisiyor, setCalisiyor] = useState(false);
  const [dikkatDagilma, setDikkatDagilma] = useState(0);
  const [kategori, setKategori] = useState("Kodlama");

  const zamanlayiciRef = useRef(null);
  const uygulamaDurumu = useRef(AppState.currentState);
  const seansBaslangicRef = useRef(null);

  // Zamanlayıcı
  useEffect(() => {
    if (calisiyor) {
      zamanlayiciRef.current = setInterval(() => {
        setKalanSaniye((s) => {
          if (s <= 1) {
            clearInterval(zamanlayiciRef.current);
            setCalisiyor(false);
            seansBitir();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(zamanlayiciRef.current);
    }

    return () => clearInterval(zamanlayiciRef.current);
  }, [calisiyor]);

  // AppState ile dikkat dağınıklığı takibi
  useEffect(() => {
    const dinleyici = AppState.addEventListener("change", (yeniDurum) => {
      if (
        uygulamaDurumu.current === "active" &&
        yeniDurum.match(/inactive|background/)
      ) {
        if (calisiyor) {
          setDikkatDagilma((d) => d + 1);
          setCalisiyor(false);
          Alert.alert("Uygulamadan çıktınız", "Seans otomatik olarak duraklatıldı.");
        }
      }
      uygulamaDurumu.current = yeniDurum;
    });

    return () => dinleyici.remove();
  }, [calisiyor]);

  function baslat() {
    seansBaslangicRef.current = new Date();
    setCalisiyor(true);
  }

  function duraklat() {
    setCalisiyor(false);
  }

  function sifirla() {
    setCalisiyor(false);
    setKalanSaniye(BASLANGIC_DAKIKA * 60);
    setDikkatDagilma(0);
  }

  async function seansBitir() {
    const bitisZamani = new Date();
    const baslangic =
      seansBaslangicRef.current ||
      new Date(bitisZamani.getTime() - (BASLANGIC_DAKIKA * 60 - kalanSaniye) * 1000);

    const gecenSaniye = Math.round((bitisZamani - baslangic) / 1000);

    const seans = {
      id: Date.now(),
      kategori,
      dikkatDagilma,
      sure: gecenSaniye,
      baslangic: baslangic.toISOString(),
      bitis: bitisZamani.toISOString(),
    };

    await seansKaydet(seans);

    Alert.alert(
      "Seans Kaydedildi",
      `Süre: ${Math.round(gecenSaniye / 60)} dakika\nDikkat Dağınıklığı: ${dikkatDagilma}`
    );

    sifirla();
  }

  const dakika = Math.floor(kalanSaniye / 60);
  const saniye = kalanSaniye % 60;

  return (
    <View style={stiller.kapsayici}>
      <Text style={stiller.sayacMetni}>
        {dakika}:{String(saniye).padStart(2, "0")}
      </Text>

      <Text style={{ marginBottom: 8 }}>Kategori</Text>
      <Picker
        selectedValue={kategori}
        style={{ width: "80%" }}
        onValueChange={(deger) => setKategori(deger)}
      >
        <Picker.Item label="Kodlama" value="Kodlama" />
        <Picker.Item label="Ders Çalışma" value="Ders" />
        <Picker.Item label="Kitap Okuma" value="Kitap" />
        <Picker.Item label="Proje" value="Proje" />
      </Picker>

      <Text style={{ marginTop: 10 }}>Dikkat Dağınıklığı: {dikkatDagilma}</Text>

      <View style={stiller.butonsatiri}>
        <Button
          title={calisiyor ? "Duraklat" : "Başlat"}
          onPress={() => (calisiyor ? duraklat() : baslat())}
        />
        <Button title="Sıfırla" onPress={sifirla} />
      </View>
    </View>
  );
}

const stiller = StyleSheet.create({
  kapsayici: { flex: 1, alignItems: "center", justifyContent: "center" },
  sayacMetni: { fontSize: 48, marginBottom: 10 },
  butonsatiri: { flexDirection: "row", marginTop: 20, gap: 10 },
});
