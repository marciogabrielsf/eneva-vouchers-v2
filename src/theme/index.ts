import { TextStyle } from "react-native";

export const COLORS = {
    background: "#f5f6fa",
    black: "#2c3e50",
    white: "#FFFFFF",
    green: "#27ae60",
    gray: "#8f92a1",
    lightGray: "#dcdde1",
    red: "#e74c3c",
    transparent: "transparent",
    primary: "#667eea",
    primaryLight: "rgba(102, 126, 234, 0.1)",
    secondary: "#764ba2",
    accent: "#3742fa",
    success: "#2ed573",
    warning: "#ffa502",
    error: "#ff3838",
    text: "#2c3e50",
    textLight: "#8f92a1",
    surface: "#ffffff",
    surfaceLight: "#f8f9ff",
};

type FontWeight = TextStyle["fontWeight"];

export const FONTS = {
    regular: {
        fontFamily: "System",
        fontWeight: "normal" as FontWeight,
    },
    medium: {
        fontFamily: "System",
        fontWeight: "500" as FontWeight,
    },
    bold: {
        fontFamily: "System",
        fontWeight: "bold" as FontWeight,
    },
};

export const SIZES = {
    base: 8,
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 32,
    xxxlarge: 40,
    padding: 16,
    radius: 12,
};

export default { COLORS, FONTS, SIZES };
