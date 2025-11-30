// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "react-native";

import TimerScreen from "./src/screens/TimerScreen";
import ReportsScreen from "./src/screens/ReportsScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: "#050b1b" },
          tabBarActiveTintColor: "#ffd700",
          tabBarInactiveTintColor: "#ffffff",
        }}
      >
        <Tab.Screen
          name="Odaklan"
          component={TimerScreen}
          options={{ tabBarLabel: "Odaklan" }}
        />
        <Tab.Screen
          name="Raporlar"
          component={ReportsScreen}
          options={{ tabBarLabel: "Raporlar" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
