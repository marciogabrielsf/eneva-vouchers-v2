import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS, FONTS, SIZES } from "../theme";

interface LoadingSpinnerProps {
    size?: "small" | "large";
    color?: string;
    text?: string;
    style?: any;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "large",
    color = "#112599",
    text = "Carregando...",
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <ActivityIndicator size={size} color={color} />
            {text && <Text style={[styles.text, { color }]}>{text}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: SIZES.padding * 2,
    },
    text: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        marginTop: SIZES.padding,
        textAlign: "center",
    },
});

export default LoadingSpinner;
