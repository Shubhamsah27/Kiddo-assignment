import React, { createContext, useContext } from "react";
import { ThemeConfig } from "../types/actions";

export const defaultTheme: ThemeConfig = {
  primary: "#FF6B6B",
  background: "#FFF9F0",
  accent: "#FFE66D",
};

export const ThemeContext = createContext<ThemeConfig>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
