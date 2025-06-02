import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS, FONTS, SIZES } from "../theme";

interface PeriodSelectorProps {
    startDate: Date;
    endDate: Date;
    onPeriodChange: (startDate: Date, endDate: Date) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ startDate, endDate, onPeriodChange }) => {
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) {
            setTempStartDate(selectedDate);
            onPeriodChange(selectedDate, tempEndDate);
        }
    };

    const handleEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) {
            setTempEndDate(selectedDate);
            onPeriodChange(tempStartDate, selectedDate);
        }
    };

    const setPresetPeriod = (preset: "thisMonth" | "lastMonth" | "thisYear" | "last90Days") => {
        const today = new Date();
        let newStartDate: Date;
        let newEndDate: Date;

        switch (preset) {
            case "thisMonth":
                newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
                newEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case "lastMonth":
                newStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                newEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case "thisYear":
                newStartDate = new Date(today.getFullYear(), 0, 1);
                newEndDate = new Date(today.getFullYear(), 11, 31);
                break;
            case "last90Days":
                newStartDate = new Date(today);
                newStartDate.setDate(today.getDate() - 90);
                newEndDate = today;
                break;
            default:
                return;
        }

        setTempStartDate(newStartDate);
        setTempEndDate(newEndDate);
        onPeriodChange(newStartDate, newEndDate);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Período para Análise</Text>

            {/* Preset buttons */}
            <View style={styles.presetContainer}>
                <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => setPresetPeriod("thisMonth")}
                >
                    <Text style={styles.presetButtonText}>Este Mês</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => setPresetPeriod("lastMonth")}
                >
                    <Text style={styles.presetButtonText}>Mês Anterior</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => setPresetPeriod("last90Days")}
                >
                    <Text style={styles.presetButtonText}>90 Dias</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => setPresetPeriod("thisYear")}
                >
                    <Text style={styles.presetButtonText}>Este Ano</Text>
                </TouchableOpacity>
            </View>

            {/* Custom date selection */}
            {/* <View style={styles.customDateContainer}>
                <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>Início:</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <Text style={styles.dateButtonText}>{formatDate(tempStartDate)}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>Fim:</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <Text style={styles.dateButtonText}>{formatDate(tempEndDate)}</Text>
                    </TouchableOpacity>
                </View>
            </View> */}

            {/* Date pickers */}
            {showStartPicker && (
                <DateTimePicker
                    value={tempStartDate}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange}
                    maximumDate={tempEndDate}
                />
            )}

            {showEndPicker && (
                <DateTimePicker
                    value={tempEndDate}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange}
                    minimumDate={tempStartDate}
                    maximumDate={new Date()}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginHorizontal: SIZES.padding,
        marginVertical: SIZES.base,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        ...FONTS.medium,
        fontSize: SIZES.large,
        color: COLORS.black,
        marginBottom: SIZES.padding,
        textAlign: "center",
    },
    presetContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: SIZES.padding,
    },
    presetButton: {
        backgroundColor: COLORS.black,
        borderRadius: SIZES.radius / 2,
        paddingVertical: SIZES.base,
        paddingHorizontal: SIZES.padding / 2,
        marginBottom: SIZES.base,
        minWidth: "22%",
        alignItems: "center",
    },
    presetButtonText: {
        ...FONTS.medium,
        fontSize: SIZES.small,
        color: COLORS.white,
        textAlign: "center",
    },
    customDateContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dateInputContainer: {
        flex: 1,
        marginHorizontal: SIZES.base / 2,
    },
    dateLabel: {
        ...FONTS.medium,
        fontSize: SIZES.small,
        color: COLORS.gray,
        marginBottom: SIZES.base / 2,
    },
    dateButton: {
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radius / 2,
        paddingVertical: SIZES.base,
        paddingHorizontal: SIZES.padding / 2,
        alignItems: "center",
    },
    dateButtonText: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.black,
    },
});

export default PeriodSelector;
