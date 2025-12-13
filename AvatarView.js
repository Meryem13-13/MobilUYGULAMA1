// src/components/AvatarView.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";

function getLevelFromStars(starCount) {
  if (starCount >= 20) return 4;
  if (starCount >= 10) return 3;
  if (starCount >= 5) return 2;
  if (starCount >= 1) return 1;
  return 0;
}

function getAvatarEmoji(level) {
  switch (level) {
    case 4:
      return "🐱‍🏍"; // Pro kedi
    case 3:
      return "🐱‍👓"; // Bilge kedi
    case 2:
      return "🐱‍💻"; // Kodlayan kedi
    case 1:
      return "🐱"; // Normal kedi
    default:
      return "⭐"; // Henüz yıldız yok
  }
}

export default function AvatarView({ starCount, theme }) {
  const level = getLevelFromStars(starCount);
  const emoji = getAvatarEmoji(level);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatarBox,
          { backgroundColor: theme.card, borderColor: theme.accent },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.info}>
          <Text style={[styles.levelText, { color: theme.textTitle }]}>
            Seviye {level}
          </Text>
          <Text style={[styles.starsText, { color: theme.textPrimary }]}>
            ⭐ {starCount} yıldız
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    top: 12,
  },
  avatarBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 32,
    marginRight: 8,
  },
  info: {},
  levelText: {
    fontSize: 14,
    fontWeight: "700",
  },
  starsText: {
    fontSize: 12,
  },
});
