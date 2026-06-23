import React, { createContext, useContext } from "react";
import { ThemeConfig } from "../types/actions";

export const defaultTheme: ThemeConfig = {
  primary: "#1E90FF",
  background: "#FFFFFF",
};

export const ThemeContext = createContext<ThemeConfig>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);
