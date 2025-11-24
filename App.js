import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

// 👇 MUTLAKA OLMASI GEREKEN IMPORTLAR
import AnaEkran from "./src/Ekranlar/AnaEkran";
import Yildizlar from "./src/Ekranlar/Yildizlar";
import Gokyuzu from "./src/Ekranlar/Gokyuzu";
import Raporlar from "./src/Ekranlar/Raporlar";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            if (route.name === "Zamanlayıcı") {
              return <MaterialIcons name="timer" size={size} color={color} />;
            }

            if (route.name === "Yıldızlar") {
              return <MaterialIcons name="star" size={size} color={color} />;
            }

            if (route.name === "Gökyüzü") {
              return <MaterialIcons name="nightlight" size={size} color={color} />;
            }

            if (route.name === "Raporlar") {
              return <MaterialIcons name="bar-chart" size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: "#facc15",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarStyle: { backgroundColor: "#0b1220" },
        })}
      >
        <Tab.Screen name="Zamanlayıcı" component={AnaEkran} />
        <Tab.Screen name="Yıldızlar" component={Yildizlar} />
        <Tab.Screen name="Gökyüzü" component={Gokyuzu} />
        <Tab.Screen name="Raporlar" component={Raporlar} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
