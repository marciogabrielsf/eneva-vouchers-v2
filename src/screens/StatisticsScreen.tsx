import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { COLORS, FONTS, SIZES } from "../theme";
import { useVouchers } from "../context/VoucherContext";
import { useSettings } from "../context/SettingsContext";
import MonthSelector from "../components/MonthSelector";
import { SafeAreaView } from "react-native-safe-area-context";

const StatisticsScreen = () => {
    const {
        totalEarnings,
        currentMonthDate,
        setCurrentMonthDate,
        categoryBreakdown,
        getMonthRangeLabel,
    } = useVouchers();
    const { discountPercentage } = useSettings();

    const handleMonthChange = (date: Date) => {
        setCurrentMonthDate(date);
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    // Calculate total for all categories
    const totalValue = Object.values(categoryBreakdown).reduce((sum, val) => sum + val, 0);

    // Get category descriptions
    const getCategoryDescription = (category: string) => {
        switch (category) {
            case "MAN":
                return "Manutenção";
            case "TRN":
                return "Transporte";
            case "DEL":
                return "Entrega";
            case "OPE":
                return "Operacional";
            case "ADM":
                return "Administrativo";
            case "GES":
                return "Gestão";
            case "ENG":
                return "Engenharia";
            default:
                return category;
        }
    };

    // Get category colors
    const getCategoryColor = (category: string) => {
        switch (category) {
            case "MAN":
                return "#4CAF50"; // Green
            case "TRN":
                return "#2196F3"; // Blue
            case "DEL":
                return "#FF9800"; // Orange
            case "OPE":
                return "#9C27B0"; // Purple
            case "ADM":
                return "#FF5722"; // Red
            case "GES":
                return "#3F51B5"; // Indigo
            case "ENG":
                return "#009688"; // Teal
            default:
                return "#9E9E9E"; // Gray
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <MonthSelector
                currentDate={currentMonthDate}
                onMonthChange={handleMonthChange}
                customDateRangeLabel={getMonthRangeLabel()}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Faturamento Mensal</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(totalEarnings)}</Text>
                    <Text style={styles.summaryTitle}>Valor Descontado</Text>
                    <Text style={styles.discountedValue}>
                        {formatCurrency(totalEarnings - totalEarnings * discountPercentage)}
                    </Text>
                </View>

                {/* Since we don't have actual chart libraries installed, we'll create a simple visualization */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Análise por Categoria</Text>

                    <View style={styles.chartLegend}>
                        {Object.entries(categoryBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([category]) => (
                                <View key={category} style={styles.legendItem}>
                                    <View
                                        style={[
                                            styles.legendColor,
                                            { backgroundColor: getCategoryColor(category) },
                                        ]}
                                    />
                                    <Text style={styles.legendText}>
                                        {getCategoryDescription(category)}
                                    </Text>
                                </View>
                            ))}
                    </View>

                    {/* Simple bar chart */}
                    <View style={styles.barChart}>
                        {Object.entries(categoryBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, value]) => (
                                <View key={category} style={styles.barContainer}>
                                    <Text style={styles.barLabel}>{category}</Text>
                                    <View style={styles.barBackground}>
                                        <View
                                            style={[
                                                styles.barFill,
                                                {
                                                    width: `${(value / totalValue) * 100}%`,
                                                    backgroundColor: getCategoryColor(category),
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.barValue}>{formatCurrency(value)}</Text>
                                </View>
                            ))}
                    </View>
                </View>

                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Detalhamento</Text>

                    {Object.entries(categoryBreakdown)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, value]) => (
                            <View key={category} style={styles.statItem}>
                                <View style={styles.statHeader}>
                                    <Text style={styles.statName}>
                                        {getCategoryDescription(category)}
                                    </Text>
                                    <Text style={styles.statValue}>{formatCurrency(value)}</Text>
                                </View>
                                <Text style={styles.statPercent}>
                                    {`${((value / totalValue) * 100).toFixed(1)}% do total`}
                                </Text>
                            </View>
                        ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: SIZES.padding * 2,
    },
    summaryCard: {
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
    summaryTitle: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.gray,
    },
    summaryValue: {
        ...FONTS.bold,
        fontSize: SIZES.xlarge,
        color: COLORS.black,
        marginTop: SIZES.base,
    },
    discountedValue: {
        ...FONTS.bold,
        fontSize: SIZES.xlarge,
        color: COLORS.green,
        marginTop: SIZES.base,
    },
    chartCard: {
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
    chartTitle: {
        ...FONTS.medium,
        fontSize: SIZES.large,
        color: COLORS.black,
        marginBottom: SIZES.padding,
    },
    chartLegend: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: SIZES.padding,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: SIZES.padding,
        marginBottom: SIZES.base,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: SIZES.base,
    },
    legendText: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.black,
    },
    barChart: {
        marginTop: SIZES.padding,
    },
    barContainer: {
        marginBottom: SIZES.padding,
    },
    barLabel: {
        ...FONTS.medium,
        fontSize: SIZES.small,
        color: COLORS.black,
        marginBottom: 4,
    },
    barBackground: {
        height: 20,
        backgroundColor: COLORS.lightGray,
        borderRadius: 10,
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        borderRadius: 10,
    },
    barValue: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.black,
        marginTop: 4,
        textAlign: "right",
    },
    statsCard: {
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
    statsTitle: {
        ...FONTS.medium,
        fontSize: SIZES.large,
        color: COLORS.black,
        marginBottom: SIZES.padding,
    },
    statItem: {
        marginBottom: SIZES.padding,
        paddingBottom: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    statHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
    },
    statName: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.black,
    },
    statValue: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: COLORS.black,
    },
    statPercent: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.gray,
    },
});

export default StatisticsScreen;
