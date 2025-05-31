import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { COLORS, FONTS, SIZES } from "../theme";
import { LinearGradient } from "expo-linear-gradient";

interface MonthSelectorProps {
    currentDate: Date;
    onMonthChange: (date: Date) => void;
    disabled?: boolean;
    customDateRangeLabel?: string;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
    currentDate,
    onMonthChange,
    disabled = false,
    customDateRangeLabel,
}) => {
    const goToPreviousMonth = () => {
        if (disabled) return;
        const prevMonth = new Date(currentDate);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        onMonthChange(prevMonth);
    };

    const goToNextMonth = () => {
        if (disabled) return;
        const nextMonth = new Date(currentDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        onMonthChange(nextMonth);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["rgba(255, 255, 255, 0.9)", "rgba(248, 249, 255, 0.9)"]}
                style={styles.selectorCard}
            >
                <TouchableOpacity
                    style={[styles.arrowButton, disabled && styles.disabledButton]}
                    onPress={goToPreviousMonth}
                    disabled={disabled}
                >
                    <Icon
                        name="chevron-left"
                        size={24}
                        color={disabled ? COLORS.textLight : COLORS.primary}
                    />
                </TouchableOpacity>

                <View style={styles.monthTextContainer}>
                    <Text style={[styles.monthText, disabled && styles.disabledText]}>
                        {customDateRangeLabel}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.arrowButton, disabled && styles.disabledButton]}
                    onPress={goToNextMonth}
                    disabled={disabled}
                >
                    <Icon
                        name="chevron-right"
                        size={24}
                        color={disabled ? COLORS.textLight : COLORS.primary}
                    />
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SIZES.padding,
        marginVertical: SIZES.base,
    },
    selectorCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SIZES.padding * 1.25,
        paddingVertical: SIZES.padding,
        borderRadius: SIZES.radius * 1.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    arrowButton: {
        width: 30,
        height: 30,
        borderRadius: 20,
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: "rgba(143, 146, 161, 0.1)",
    },
    monthTextContainer: {
        alignItems: "center",
        flex: 1,
        paddingHorizontal: SIZES.padding,
    },
    monthText: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: COLORS.text,
        textAlign: "center",
    },
    customRangeText: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.gray,
        marginTop: 2,
    },
    disabledText: {
        color: COLORS.gray,
    },
});

export default MonthSelector;
