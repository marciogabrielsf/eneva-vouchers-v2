import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { COLORS, FONTS, SIZES } from "../theme";

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
            <TouchableOpacity
                style={[styles.arrowButton, disabled && styles.disabledButton]}
                onPress={goToPreviousMonth}
                disabled={disabled}
            >
                <Icon name="chevron-left" size={24} color={disabled ? COLORS.gray : COLORS.black} />
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
                    color={disabled ? COLORS.gray : COLORS.black}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.base,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        marginHorizontal: SIZES.padding,
        marginVertical: SIZES.base,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    arrowButton: {
        padding: SIZES.base,
    },
    disabledButton: {
        opacity: 0.5,
    },
    monthTextContainer: {
        alignItems: "center",
    },
    monthText: {
        ...FONTS.medium,
        fontSize: SIZES.large,
        color: COLORS.black,
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
