import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Button } from "react-native";
import { seanslariGetir, seanslariTemizle } from "../yardimci/depolama";

export default function RaporlarEkrani() {
  const [seanslar, setSeanslar] = useState([]);

  useEffect(() => {
    async function yukle() {
      const liste = await seanslariGetir();
      setSeanslar(liste.reverse());
    }
    yukle();
  }, []);

  const toplamSure = seanslar.reduce((acc, s) => acc + (s.sure || 0), 0);
  const toplamDikkat = seanslar.reduce(
    (acc, s) => acc + (s.dikkatDagilma || 0),
    0
  );

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 18 }}>
        Toplam Odaklanma Süresi: {Math.round(toplamSure / 60)} dakika
      </Text>
      <Text style={{ marginBottom: 10 }}>
        Toplam Dikkat Dağınıklığı: {toplamDikkat}
      </Text>

      <Button
        title="Tüm Seansları Sil"
        onPress={async () => {
          await seanslariTemizle();
          setSeanslar([]);
        }}
      />

      <Text style={{ marginTop: 20, fontSize: 16 }}>Seans Kayıtları:</Text>

      {seanslar.map((s) => (
        <View key={s.id} style={{ padding: 8, borderBottomWidth: 1 }}>
          <Text>
            {new Date(s.baslangic).toLocaleString()} — {Math.round(s.sure / 60)}{" "}
            dk — {s.kategori} — Dikkat: {s.dikkatDagilma}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
