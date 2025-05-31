import { TextStyle } from "react-native";

export const COLORS = {
    background: "#E0E0E0",
    black: "#000000",
    white: "#FFFFFF",
    green: "#32CD32",
    gray: "#A9A9A9",
    lightGray: "#D3D3D3",
    red: "#FF0000",
    transparent: "transparent",
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
