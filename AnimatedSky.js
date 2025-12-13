// src/components/AnimatedSky.js

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function AnimatedSky({ moodColor }) {
  const starOpacity = useRef(new Animated.Value(0.4)).current;
  const cloudX = useRef(new Animated.Value(0)).current;

  // Yıldız parlaması
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(starOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(starOpacity, {
          toValue: 0.4,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [starOpacity]);

  // Bulut kayması
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudX, {
          toValue: -width,
          duration: 25000,
          useNativeDriver: true,
        }),
        Animated.timing(cloudX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [cloudX]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: moodColor || "#020617" },
      ]}
    >
      {/* Bulutlar */}
      <Animated.View
        style={[
          styles.cloudRow,
          {
            transform: [{ translateX: cloudX }],
          },
        ]}
      >
        <View style={styles.cloud} />
        <View style={[styles.cloud, { marginLeft: 60 }]} />
        <View style={[styles.cloud, { marginLeft: 120 }]} />
      </Animated.View>

      {/* Yıldızlar */}
      <Animated.View style={[styles.starLayer, { opacity: starOpacity }]}>
        {Array.from({ length: 35 }).map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.star,
              {
                top: Math.random() * 80,
                left: Math.random() * width,
              },
            ]}
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 130,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
  },
  cloudRow: {
    position: "absolute",
    top: 10,
    left: 0,
    flexDirection: "row",
  },
  cloud: {
    width: 90,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  starLayer: {
    flex: 1,
  },
  star: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fef9c3",
  },
});
