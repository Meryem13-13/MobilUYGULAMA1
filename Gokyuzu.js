// src/Ekranlar/Gokyuzu.js (opsiyonel)
import React, {useEffect, useState} from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { yildizlariGetir } from "../yardimci/depolama";

export default function Gokyuzu() {
  const [yildizlar, setYildizlar] = useState([]);
  useEffect(()=>{ (async ()=> setYildizlar(await yildizlariGetir()))(); }, []);
  return (
    <ScrollView contentContainerStyle={stil.container}>
      <Text style={{color:"white", fontSize:20, marginBottom:12}}>Gökyüzü</Text>
      <View style={{flexDirection:"row", flexWrap:"wrap", width:"100%", justifyContent:"center"}}>
        {yildizlar.map((y, i) => (
          <Text key={y.id} style={{fontSize:30, margin:6}}>⭐</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const stil = StyleSheet.create({
  container: {flex:1, backgroundColor: "#0b1220", alignItems:"center", padding:16, minHeight:600}
});
