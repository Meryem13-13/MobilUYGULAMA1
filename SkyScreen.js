// src/screens/SkyScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { getAllSessions } from "../storage/sessionStorage";
import StarSky from "../components/StarSky";

export default function SkyScreen() {
  const [starCount, setStarCount] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("galaxy"); // varsayılan arama

  const fetchNASA = async (searchTerm) => {
    if (!searchTerm) return;

    setLoading(true);

    try {
      const response = await fetch(
        `https://images-api.nasa.gov/search?q=${searchTerm}&media_type=image`
      );

      const json = await response.json();
      const items = json.collection.items;

      const photoData = items
        .filter((item) => item.links && item.links[0] && item.links[0].href)
        .slice(0, 12)
        .map((item) => ({
          url: item.links[0].href,
          title: item.data[0]?.title || "No Title",
        }));

      setPhotos(photoData);
    } catch (error) {
      console.log("NASA API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStars = async () => {
    const sessions = await getAllSessions();
    const focus = sessions.filter((s) => s.type === "focus");
    setStarCount(focus.length);
  };

  useEffect(() => {
    loadStars();
    fetchNASA(query); // uygulama açıldığında varsayılan arama
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gökyüzü</Text>

      {/* ⭐ Yıldızlar */}
      <StarSky starCount={starCount} />

      <Text style={styles.starText}>Toplam Yıldızın: {starCount}</Text>

      {/* 🔍 Arama Kutusu */}
      <Text style={styles.subtitle}>NASA Fotoğraf Arama</Text>

      <TextInput
        style={styles.input}
        placeholder="Ör: moon, mars, galaxy, nebula..."
        placeholderTextColor="#94a3b8"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          fetchNASA(text);
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.grid}>
          {photos.map((p, i) => (
            <View key={i} style={styles.card}>
              <Image source={{ uri: p.url }} style={styles.photo} />
              <Text numberOfLines={2} style={styles.photoTitle}>
                {p.title}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", padding: 16 },
  title: {
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "bold",
  },
  starText: {
    color: "#e5e7eb",
    textAlign: "center",
    marginVertical: 12,
    fontSize: 16,
  },
  subtitle: {
    color: "#fff",
    fontSize: 20,
    marginTop: 12,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#0f172a",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 12,
    backgroundColor: "#0f172a",
    padding: 6,
    borderRadius: 12,
  },
  photo: {
    width: "100%",
    height: 130,
    borderRadius: 10,
  },
  photoTitle: {
    color: "#fff",
    marginTop: 6,
    fontSize: 13,
  },
});
