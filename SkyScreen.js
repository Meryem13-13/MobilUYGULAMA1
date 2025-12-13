import React, { useEffect, useState, useContext } from "react";
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
import { ThemeContext } from "../theme/ThemeContext";

export default function SkyScreen() {
  const { theme } = useContext(ThemeContext);

  const [starCount, setStarCount] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("galaxy");

  // ⭐ NASA’dan görsel çekme
  const fetchNASA = async (searchTerm) => {
    if (!searchTerm) return;

    setLoading(true);

    try {
      const res = await fetch(
        `https://images-api.nasa.gov/search?q=${searchTerm}&media_type=image`
      );
      const json = await res.json();

      const items = json.collection.items;

      const results = items
        ?.filter((item) => item.links && item.links[0]?.href)
        .slice(0, 12)
        .map((item) => ({
          url: item.links[0].href,
          title: item.data[0]?.title ?? "Fotoğraf",
        }));

      setPhotos(results);
    } catch (err) {
      console.log("NASA API Hata:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Yıldız sayısını yükle
  const loadStars = async () => {
    const sessions = await getAllSessions();
    const focusSessions = sessions.filter((s) => s.type === "focus");
    setStarCount(focusSessions.length);
  };

  useEffect(() => {
    loadStars();
    fetchNASA(query);
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.title, { color: theme.textTitle }]}>Gökyüzü</Text>

      {/* ⭐ Yıldız ekranı */}
      <StarSky starCount={starCount} />

      <Text style={[styles.starText, { color: theme.textPrimary }]}>
        Toplam Yıldız: {starCount}
      </Text>

      {/* 🔍 Arama kutusu */}
      <Text style={[styles.subtitle, { color: theme.textTitle }]}>
        NASA Fotoğraf Arama
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            borderColor: theme.accent,
            color: theme.textPrimary,
          },
        ]}
        placeholder="Ör: moon, nebula, galaxy..."
        placeholderTextColor={theme.textPrimary}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          fetchNASA(text);
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} />
      ) : (
        <View style={styles.grid}>
          {photos.map((p, index) => (
            <View
              key={index}
              style={[styles.card, { backgroundColor: theme.card }]}
            >
              <Image source={{ uri: p.url }} style={styles.photo} />

              <Text
                numberOfLines={2}
                style={[styles.photoTitle, { color: theme.textPrimary }]}
              >
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
  container: { flex: 1, padding: 16 },

  title: {
    fontSize: 26,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "bold",
  },

  starText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },

  photo: {
    width: "100%",
    height: 130,
    borderRadius: 10,
  },

  photoTitle: {
    marginTop: 6,
    fontSize: 13,
  },
});
