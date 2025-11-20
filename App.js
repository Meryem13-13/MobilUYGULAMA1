import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

import AnaEkran from "./src/Ekranlar/AnaEkran";
import Raporlar from "./src/Ekranlar/Raporlar";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            if (route.name === "Zamanlayıcı")
              return <MaterialIcons name="timer" size={size} color={color} />;
            if (route.name === "Raporlar")
              return <MaterialIcons name="bar-chart" size={size} color={color} />;
          },
          tabBarActiveTintColor: "#2563eb",
          tabBarInactiveTintColor: "#6b7280",
        })}
      >
        <Tab.Screen name="Zamanlayıcı" component={AnaEkran} />
        <Tab.Screen name="Raporlar" component={Raporlar} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
