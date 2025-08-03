import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Expense, ExpenseCategory } from "../types";
import { COLORS, FONTS, SIZES } from "../theme";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowUpRight } from "lucide-react-native";

interface ExpenseItemProps {
    expense: Expense;
    onPress: (expense: Expense) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onPress }) => {
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

    const getCategoryName = (category: ExpenseCategory) => {
        const categoryNames: Record<ExpenseCategory, string> = {
            [ExpenseCategory.FOOD]: "Alimentação",
            [ExpenseCategory.TRANSPORT]: "Transporte",
            [ExpenseCategory.HOUSING]: "Moradia",
            [ExpenseCategory.ENTERTAINMENT]: "Entretenimento",
            [ExpenseCategory.HEALTHCARE]: "Saúde",
            [ExpenseCategory.EDUCATION]: "Educação",
            [ExpenseCategory.UTILITIES]: "Utilidades",
            [ExpenseCategory.SHOPPING]: "Compras",
            [ExpenseCategory.OTHER]: "Outros",
        };
        return categoryNames[category] || category;
    };

    const getCategoryColor = (category: ExpenseCategory) => {
        const categoryColors: Record<ExpenseCategory, string> = {
            [ExpenseCategory.FOOD]: "#FF6B6B",
            [ExpenseCategory.TRANSPORT]: "#4ECDC4",
            [ExpenseCategory.HOUSING]: "#45B7D1",
            [ExpenseCategory.ENTERTAINMENT]: "#96CEB4",
            [ExpenseCategory.HEALTHCARE]: "#FFEAA7",
            [ExpenseCategory.EDUCATION]: "#DDA0DD",
            [ExpenseCategory.UTILITIES]: "#98D8C8",
            [ExpenseCategory.SHOPPING]: "#F7DC6F",
            [ExpenseCategory.OTHER]: "#BDC3C7",
        };
        return categoryColors[category] || "#BDC3C7";
    };

    const formattedDate = new Date(expense.date).toLocaleDateString("pt-BR", {
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
                onPress={() => onPress(expense)}
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
                                outputRange: ["rgba(255, 107, 107, 0)", "rgba(255, 107, 107, 0.2)"],
                            }),
                        },
                    ]}
                >
                    <LinearGradient
                        colors={isPressed ? ["#ffe8e8", "#ffdcdc"] : ["#ffffff", "#fff8f8"]}
                        style={styles.gradientCard}
                    >
                        <View style={styles.cardHeader}>
                            <View
                                style={[
                                    styles.categoryBadge,
                                    { backgroundColor: getCategoryColor(expense.category) + "20" },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        { color: getCategoryColor(expense.category) },
                                    ]}
                                >
                                    {getCategoryName(expense.category)}
                                </Text>
                            </View>
                            <Text style={styles.date}>{formattedDate}</Text>
                        </View>

                        {expense.description && (
                            <View style={styles.infoContainer}>
                                <Text style={styles.label}>Descrição</Text>
                                <Text style={styles.value} numberOfLines={2}>
                                    {expense.description}
                                </Text>
                            </View>
                        )}

                        <View style={styles.bottomRow}>
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceLabel}>Valor</Text>
                                <Text style={styles.price}>{formatValue(expense.value)}</Text>
                            </View>
                            <View style={styles.arrowContainer}>
                                <ArrowUpRight color="#FF6B6B" />
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
        paddingHorizontal: SIZES.base * 1.5,
        paddingVertical: SIZES.base / 2,
        borderRadius: SIZES.radius,
    },
    categoryText: {
        ...FONTS.medium,
        fontSize: SIZES.small,
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
        color: "#FF6B6B",
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255, 107, 107, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
});

export default React.memo(ExpenseItem);
