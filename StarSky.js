// src/components/StarSky.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StarSky({ starCount }) {
  const stars = Array.from({ length: starCount });

  return (
    <View style={styles.sky}>
      {stars.map((_, index) => {
        const top = (index * 23) % 100;
        const left = (index * 37) % 100;
        return (
          <Text
            key={index}
            style={[
              styles.star,
              {
                top: `${top}%`,
                left: `${left}%`,
              },
            ]}
          >
            ★
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sky: {
    height: 180,
    backgroundColor: "#020617", // koyu gece mavisi
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  star: {
    position: "absolute",
    fontSize: 18,
    color: "#ffd700",
  },
});
