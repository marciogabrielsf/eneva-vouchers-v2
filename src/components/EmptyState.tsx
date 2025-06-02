import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "../theme";

interface EmptyStateProps {
    icon?: string;
    title: string;
    subtitle?: string;
    style?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon = "inbox-outline",
    title,
    subtitle,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <Icon name={icon} size={64} color="#8f92a1" />
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: SIZES.padding * 3,
        paddingHorizontal: SIZES.padding,
    },
    title: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: "#2c3e50",
        marginTop: SIZES.padding,
        textAlign: "center",
    },
    subtitle: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: "#8f92a1",
        marginTop: SIZES.base,
        textAlign: "center",
    },
});

export default EmptyState;
