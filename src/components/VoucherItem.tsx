import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Voucher } from "../types";
import { COLORS, FONTS, SIZES } from "../theme";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowUpRight } from "lucide-react-native";

interface VoucherItemProps {
    voucher: Voucher;
    onPress: (voucher: Voucher) => void;
}

const VoucherItem: React.FC<VoucherItemProps> = ({ voucher, onPress }) => {
    const [isPressed, setIsPressed] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shadowAnim = useRef(new Animated.Value(0.1)).current;
    const borderAnim = useRef(new Animated.Value(0)).current;

    const formatValue = (value: number) => {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const categoryName = (code: string) => {
        const category = code.substring(0, 3);
        switch (category) {
            case "MAN":
                return "Manutenção";
            case "TRN":
                return "Transporte";
            case "DEL":
                return "Entrega";
            default:
                return category;
        }
    };

    const formattedDate = new Date(voucher.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "utc",
    });

    const handlePressIn = () => {
        setIsPressed(true);
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.98,
                useNativeDriver: true,
                tension: 300,
                friction: 10,
            }),
            Animated.timing(shadowAnim, {
                toValue: 0.15,
                duration: 150,
                useNativeDriver: false,
            }),
            Animated.timing(borderAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: false,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        setIsPressed(false);
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 300,
                friction: 10,
            }),
            Animated.timing(shadowAnim, {
                toValue: 0.1,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(borderAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start();
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                style={styles.touchable}
                onPress={() => onPress(voucher)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <Animated.View
                    style={[
                        styles.gradientContainer,
                        {
                            shadowOpacity: shadowAnim,
                            borderWidth: borderAnim,
                            borderColor: borderAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["rgba(102, 126, 234, 0)", "rgba(102, 126, 234, 0.2)"],
                            }),
                        },
                    ]}
                >
                    <LinearGradient 
                        colors={isPressed ? ["#e8ecff", "#dce4ff"] : ["#ffffff", "#f8f9ff"]} 
                        style={styles.gradientCard}
                    >
                <View style={styles.cardHeader}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{categoryName(voucher.requestCode)}</Text>
                    </View>
                    <Text style={styles.date}>{formattedDate}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Voucher</Text>
                    <Text style={styles.value}>
                        {voucher.taxNumber} - {voucher.requestCode}
                    </Text>
                </View>

                <View style={styles.bottomRow}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Valor</Text>
                        <Text style={styles.price}>{formatValue(voucher.value)}</Text>
                    </View>
                    <View style={styles.arrowContainer}>
                        <ArrowUpRight />
                    </View>
                </View>
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: SIZES.padding,
        marginVertical: SIZES.base,
    },
    touchable: {
        width: "100%",
    },
    gradientContainer: {
        borderRadius: SIZES.radius * 1.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    containerPressed: {
        transform: [{ scale: 0.98 }],
    },
    gradientCard: {
        borderRadius: SIZES.radius * 1.5,
        padding: SIZES.padding * 1.25,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SIZES.padding,
    },
    categoryBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: SIZES.base * 1.5,
        paddingVertical: SIZES.base / 2,
        borderRadius: SIZES.radius,
    },
    categoryText: {
        ...FONTS.medium,
        fontSize: SIZES.small,
        color: COLORS.primary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    infoContainer: {
        marginBottom: SIZES.padding,
    },
    label: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginBottom: SIZES.base / 2,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    value: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.text,
        lineHeight: 22,
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.textLight,
        marginBottom: SIZES.base / 2,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    date: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.textLight,
    },
    price: {
        ...FONTS.bold,
        fontSize: SIZES.large,
        color: COLORS.success,
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    arrow: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: "bold",
    },
});

export default VoucherItem;
