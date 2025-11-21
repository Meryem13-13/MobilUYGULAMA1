// src/Ekranlar/Raporlar.js
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Button } from "react-native";
import { seanslariGetir, seanslariTemizle, yildizlariGetir, yildizlariTemizle } from "../yardimci/depolama";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const EKRAN_GENISLIK = Dimensions.get("window").width - 32;

export default function Raporlar() {
  const [seanslar, setSeanslar] = useState([]);
  const [yildizlar, setYildizlar] = useState([]);

  useEffect(() => {
    (async () => {
      const s = await seanslariGetir();
      const y = await yildizlariGetir();
      setSeanslar(s.reverse());
      setYildizlar(y);
    })();
  }, []);

  // 🔥 YENİ: Sadece 'odak' seanslarını filtrele
  const odakSeanslar = seanslar.filter(s => s.tip === "odak");

  // İstatistikler artık sadece odak seansları üzerinden hesaplanacak
  const toplamSure = odakSeanslar.reduce((acc, s) => acc + (s.sure || 0), 0);
  const toplamDikkat = odakSeanslar.reduce((acc, s) => acc + (s.dikkat || 0), 0); // Dikkat zaten sadece odak seanslarında giriliyordu

  // Bugün için toplam (gün başlangıcı)
  const bugun = new Date();
  bugun.setHours(0,0,0,0);
  const todaySeconds = odakSeanslar // 🔥 odakSeanslar kullanıldı
    .filter(s => new Date(s.baslangic) >= bugun)
    .reduce((acc, s) => acc + (s.sure || 0), 0);

  // Haftalık veri: son 7 gün için günlük toplam saniyeler
  const gunler = [];
  const gunEtiketleri = [];
  for (let i=6;i>=0;i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    gunEtiketleri.push(`${d.getDate()}/${d.getMonth()+1}`);
    const toplamGun = odakSeanslar // 🔥 odakSeanslar kullanıldı
      .filter(s => {
        const b = new Date(s.baslangic);
        return b >= d && b < new Date(d.getTime() + 24*60*60*1000);
      })
      .reduce((acc,s)=> acc + (s.sure||0),0);
    gunler.push(Math.round(toplamGun/60)); // dk cinsinden
  }

  return (
    <ScrollView style={{padding:16, backgroundColor:"#f8fafc"}}>
      <View style={{flexDirection:"row", justifyContent:"space-between"}}>
        <View style={{flex:1, padding:12, backgroundColor:"white", borderRadius:10, marginRight:8}}>
          <Text style={{color:"#6b7280"}}>Bugün</Text>
          <Text style={{fontSize:20, fontWeight:"700"}}>{Math.round(todaySeconds/60)} dk</Text>
        </View>
        <View style={{flex:1, padding:12, backgroundColor:"white", borderRadius:10}}>
          <Text style={{color:"#6b7280"}}>Tüm Zamanlar</Text>
          <Text style={{fontSize:20, fontWeight:"700"}}>{Math.round(toplamSure/60)} dk</Text>
        </View>
      </View>

      <View style={{marginTop:12}}>
        <Text style={{color:"#6b7280"}}>Toplam Dikkat Dağınıklığı</Text>
        <Text style={{fontSize:18, fontWeight:"600"}}>{toplamDikkat}</Text>
      </View>

      <View style={{marginTop:16}}>
        <Text style={{fontWeight:"600", marginBottom:6}}>Son 7 Gün</Text>
        <BarChart
          data={{
            labels: gunEtiketleri,
            datasets: [{ data: gunler }]
          }}
          width={EKRAN_GENISLIK}
          height={200}
          chartConfig={{
            backgroundGradientFrom: "#f8fafc",
            backgroundGradientTo: "#f8fafc",
            decimalPlaces: 0,
            color: (opacity=1) => `rgba(59,130,246, ${opacity})`,
            labelColor: (opacity=1) => `rgba(51,65,85, ${opacity})`
          }}
          style={{borderRadius:8}}
          fromZero
        />
      </View>

      <View style={{marginTop:16}}>
        <Text style={{fontWeight:"600", marginBottom:6}}>Yıldızlar (Toplam)</Text>
        <Text style={{fontSize:18, fontWeight:"700"}}>{yildizlar.length}</Text>
        <Button title="Yıldızları Temizle" onPress={async ()=>{
          await yildizlariTemizle();
          setYildizlar([]);
        }} />
      </View>

      <View style={{marginTop:16}}>
        <Button title="Tüm Seansları Sil" onPress={async ()=>{ await seanslariTemizle(); setSeanslar([]); }} />
      </View>

      <View style={{marginTop:12}}>
        <Text style={{fontWeight:"600"}}>Seans Listesi (Tümü)</Text>
        {seanslar.map(s => (
          <View key={s.id} style={{backgroundColor:"white", padding:10, borderRadius:10, marginTop:8}}>
            <Text style={{fontWeight:"700"}}>{s.kategori} — {Math.round(s.sure/60)} dk ({s.tip === "odak" ? "Odak" : "Ara"})</Text>
            <Text style={{color:"gray", marginTop:4}}>Dikkat: {s.dikkat}</Text>
            <Text style={{color:"gray", marginTop:2}}>{new Date(s.baslangic).toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}