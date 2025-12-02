import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themes } from "./themes";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(themes.pastel); // varsayılan

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem("appTheme");
      if (saved && themes[saved]) {
        setTheme(themes[saved]);
      }
    };
    loadTheme();
  }, []);

  const changeTheme = async (name) => {
    await AsyncStorage.setItem("appTheme", name);
    setTheme(themes[name]);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
