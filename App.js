import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AnaEkran from "./src/Ekranlar/AnaEkran";
import RaporlarEkrani from "./src/Ekranlar/Raporlar";

const Sekme = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Sekme.Navigator screenOptions={{ headerShown: false }}>
        <Sekme.Screen name="Zamanlayıcı" component={AnaEkran} />
        <Sekme.Screen name="Raporlar" component={Raporlar} />
      </Sekme.Navigator>
    </NavigationContainer>
  );
}
