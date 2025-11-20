import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Button } from "react-native";
import { seanslariGetir, seanslariTemizle } from "../yardimci/depolama";

export default function Raporlar() {
  const [seanslar, setSeanslar] = useState([]);

  useEffect(() => {
    async function yukle() {
      const liste = await seanslariGetir();
      setSeanslar(liste.reverse());
    }
    yukle();
  }, []);

  const toplamSure = seanslar.reduce((s, x) => s + (x.sure || 0), 0);
  const toplamDikkat = seanslar.reduce((s, x) => s + (x.dikkat || 0), 0);

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 18 }}>Toplam Odaklanma Süresi: {Math.round(toplamSure / 60)} dk</Text>
      <Text style={{ marginBottom: 12 }}>Toplam Dikkat Dağınıklığı: {toplamDikkat}</Text>

      <Button
        title="Tüm Seansları Sil"
        onPress={async () => {
          await seanslariTemizle();
          setSeanslar([]);
        }}
      />

      {seanslar.map((s) => (
        <View key={s.id} style={{ paddingVertical: 8, borderBottomWidth: 1 }}>
          <Text>{s.kategori} — {Math.round(s.sure / 60)} dk — Dikkat: {s.dikkat}</Text>
          <Text style={{ color: "gray" }}>{new Date(s.baslangic).toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
