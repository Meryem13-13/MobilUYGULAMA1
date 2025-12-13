// src/components/MoodSelector.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MOOD_CONFIG, MOOD_KEYS } from "../mood/moodConfig";

export default function MoodSelector({ currentMood, onChange, theme }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textTitle }]}>
        Ruh Hâlini Seç
      </Text>

      <View style={styles.row}>
        {MOOD_KEYS.map((key) => {
          const mood = MOOD_CONFIG[key];
          const isActive = currentMood === key;

          return (
            <TouchableOpacity
              key={key}
              onPress={() => onChange(key)}
              style={[
                styles.moodButton,
                {
                  borderColor: theme.accent || "#FB7185",
                  backgroundColor: isActive ? (theme.accent || "#FB7185") : theme.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.moodEmoji,
                  { color: isActive ? "#ffffff" : theme.textPrimary },
                ]}
              >
                {mood.emoji}
              </Text>
              <Text
                style={[
                  styles.moodLabel,
                  { color: isActive ? "#ffffff" : theme.textPrimary },
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  moodButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 18,
    marginRight: 4,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
});
