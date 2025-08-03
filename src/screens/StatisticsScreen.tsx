import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS, SIZES } from "../theme";
import { useVouchers } from "../context/VoucherContext";
import { useSettings } from "../context/SettingsContext";
import MonthSelector from "../components/MonthSelector";
import EarningsChart from "../components/EarningsChart";
import PeriodSelector from "../components/PeriodSelector";
import { SafeAreaView } from "react-native-safe-area-context";
import { FocusAwareStatusBar } from "../components/focusAwareStatusBar";
import { formatCurrency } from "../utils/formatters";

const StatisticsScreen = () => {
    const {
        totalEarnings,
        currentMonthDate,
        setCurrentMonthDate,
        categoryBreakdown,
        getMonthRangeLabel,
        isLoading,
    } = useVouchers();
    const { discountPercentage } = useSettings();

    // State for chart period (separate from category breakdown period)
    const [chartStartDate, setChartStartDate] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });
    const [chartEndDate, setChartEndDate] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() + 1, 0);
    });

    const handleMonthChange = useCallback(
        (date: Date) => {
            setCurrentMonthDate(date);
        },
        [setCurrentMonthDate]
    );

    const handleChartPeriodChange = useCallback((startDate: Date, endDate: Date) => {
        setChartStartDate(startDate);
        setChartEndDate(endDate);
    }, []);

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

    // Get category light colors for gradients
    const getCategoryLightColor = (category: string) => {
        switch (category) {
            case "MAN":
                return "#81C784"; // Light Green
            case "TRN":
                return "#64B5F6"; // Light Blue
            case "DEL":
                return "#FFB74D"; // Light Orange
            case "OPE":
                return "#BA68C8"; // Light Purple
            case "ADM":
                return "#FF8A65"; // Light Red
            case "GES":
                return "#7986CB"; // Light Indigo
            case "ENG":
                return "#4DB6AC"; // Light Teal
            default:
                return "#BDBDBD"; // Light Gray
        }
    };

    return (
        <>
            <FocusAwareStatusBar backgroundColor="#000" animated style="light" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <SafeAreaView edges={["top"]}>
                    {/* Header */}
                    <LinearGradient colors={["#000000", "#161616"]} style={styles.headerGradient}>
                        <Text style={styles.headerTitle}>Estatísticas</Text>
                        <Text style={styles.headerSubtitle}>Análise detalhada dos vouchers</Text>
                    </LinearGradient>
                </SafeAreaView>

                {/* Period Selector for Charts */}
                <PeriodSelector
                    startDate={chartStartDate}
                    endDate={chartEndDate}
                    onPeriodChange={handleChartPeriodChange}
                />

                {/* Earnings Chart */}
                <EarningsChart startDate={chartStartDate} endDate={chartEndDate} />

                {/* Month Selector */}
                <MonthSelector
                    currentDate={currentMonthDate}
                    onMonthChange={handleMonthChange}
                    customDateRangeLabel={getMonthRangeLabel()}
                />

                {/* Summary Cards Row */}
                <View style={styles.summaryRow}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#112599" />
                            <Text style={styles.loadingText}>Carregando estatísticas...</Text>
                        </View>
                    ) : (
                        <>
                            <LinearGradient
                                colors={["#112599", "#3841ef"]}
                                style={[styles.summaryCard, styles.summaryCardLeft]}
                            >
                                <Text style={styles.summaryCardTitle}>Faturamento</Text>
                                <Text style={styles.summaryCardValue} numberOfLines={1}>
                                    {formatCurrency(totalEarnings)}
                                </Text>
                            </LinearGradient>

                            <LinearGradient
                                colors={["#11998e", "#31de73"]}
                                style={[styles.summaryCard, styles.summaryCardRight]}
                            >
                                <Text style={styles.summaryCardTitle}>Valor Líquido</Text>
                                <Text style={styles.summaryCardValue} numberOfLines={1}>
                                    {formatCurrency(
                                        totalEarnings - totalEarnings * discountPercentage
                                    )}
                                </Text>
                            </LinearGradient>
                        </>
                    )}
                </View>

                {/* Category Analysis */}
                <View style={styles.modernCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Análise por Categoria</Text>
                        <View style={styles.titleUnderline} />
                    </View>

                    {isLoading ? (
                        <View style={styles.categoryLoadingContainer}>
                            <ActivityIndicator size="large" color="#112599" />
                            <Text style={styles.loadingText}>Carregando análise...</Text>
                        </View>
                    ) : Object.keys(categoryBreakdown).length > 0 ? (
                        <>
                            <View style={styles.categoryLegend}>
                                {Object.entries(categoryBreakdown)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([category]) => (
                                        <View key={category} style={styles.legendItem}>
                                            <LinearGradient
                                                colors={[
                                                    getCategoryColor(category),
                                                    getCategoryLightColor(category),
                                                ]}
                                                style={styles.legendDot}
                                            />
                                            <Text style={styles.legendText}>
                                                {getCategoryDescription(category)}
                                            </Text>
                                        </View>
                                    ))}
                            </View>

                            {/* Modern Bar Chart */}
                            <View style={styles.barChart}>
                                {Object.entries(categoryBreakdown)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([category, value]) => (
                                        <View key={category} style={styles.barContainer}>
                                            <View style={styles.barHeader}>
                                                <Text style={styles.barLabel}>{category}</Text>
                                                <Text style={styles.barValue}>
                                                    {formatCurrency(value)}
                                                </Text>
                                            </View>
                                            <View style={styles.barBackground}>
                                                <LinearGradient
                                                    colors={[
                                                        getCategoryColor(category),
                                                        getCategoryLightColor(category),
                                                    ]}
                                                    style={[
                                                        styles.barFill,
                                                        {
                                                            width: `${(value / totalValue) * 100}%`,
                                                        },
                                                    ]}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                />
                                            </View>
                                        </View>
                                    ))}
                            </View>
                        </>
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateText}>Nenhum dado disponível</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Adicione vouchers para ver as estatísticas
                            </Text>
                        </View>
                    )}
                </View>

                {/* Detailed Statistics */}
                <View style={styles.modernCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Detalhamento Completo</Text>
                        <View style={styles.titleUnderline} />
                    </View>

                    {Object.entries(categoryBreakdown)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, value], index) => (
                            <View key={category} style={styles.statItem}>
                                <View style={styles.statRow}>
                                    <View style={styles.statLeft}>
                                        <LinearGradient
                                            colors={[
                                                getCategoryColor(category),
                                                getCategoryLightColor(category),
                                            ]}
                                            style={styles.statIcon}
                                        />
                                        <View>
                                            <Text style={styles.statName}>
                                                {getCategoryDescription(category)}
                                            </Text>
                                            <Text style={styles.statPercent}>
                                                {`${((value / totalValue) * 100).toFixed(
                                                    1
                                                )}% do total`}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.statValue}>{formatCurrency(value)}</Text>
                                </View>
                                {index < Object.entries(categoryBreakdown).length - 1 && (
                                    <View style={styles.statDivider} />
                                )}
                            </View>
                        ))}
                </View>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    headerGradient: {
        paddingTop: SIZES.padding * 100,
        marginTop: -SIZES.padding * 98.5,
        paddingBottom: SIZES.padding * 1.5,
        paddingHorizontal: SIZES.padding,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: SIZES.padding,
    },
    headerTitle: {
        ...FONTS.bold,
        fontSize: 28,
        color: "#ffffff",
        textAlign: "center",
        marginBottom: 8,
    },
    headerSubtitle: {
        ...FONTS.regular,
        fontSize: 16,
        color: "#ffffff",
        textAlign: "center",
        opacity: 0.9,
    },
    scrollContent: {
        paddingBottom: SIZES.padding * 3,
    },
    modernCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: SIZES.padding * 1.2,
        marginHorizontal: SIZES.padding,
        marginVertical: SIZES.base,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    summaryRow: {
        flexDirection: "row",
        marginHorizontal: SIZES.padding,
        marginVertical: SIZES.padding,
        gap: 5,
    },
    summaryCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ffffff20",
        borderRadius: 20,
        padding: SIZES.padding,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    summaryCardLeft: {
        // Removido marginRight desnecessário pois já temos gap no summaryRow
    },
    summaryCardRight: {
        // Removido marginLeft desnecessário pois já temos gap no summaryRow
    },
    summaryCardTitle: {
        ...FONTS.medium,
        fontSize: 14,
        color: "#ffffff",
        opacity: 0.9,
        marginBottom: 8,
    },
    summaryCardValue: {
        ...FONTS.bold,
        fontSize: 18,
        color: "#ffffff",
    },
    cardHeader: {
        marginBottom: SIZES.padding,
    },
    cardTitle: {
        ...FONTS.bold,
        fontSize: 20,
        color: "#1e293b",
        marginBottom: 8,
    },
    titleUnderline: {
        height: 3,
        width: 40,
        backgroundColor: "#667eea",
        borderRadius: 2,
    },
    categoryLegend: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: SIZES.padding,
        gap: 12,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        ...FONTS.medium,
        fontSize: 12,
        color: "#475569",
    },
    barChart: {
        marginTop: SIZES.padding,
        gap: 16,
    },
    barContainer: {
        marginBottom: 4,
    },
    barHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    barLabel: {
        ...FONTS.medium,
        fontSize: 14,
        color: "#374151",
    },
    barValue: {
        ...FONTS.bold,
        fontSize: 14,
        color: "#1e293b",
    },
    barBackground: {
        height: 12,
        backgroundColor: "#f1f5f9",
        borderRadius: 8,
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        borderRadius: 8,
    },
    statItem: {
        marginBottom: 4,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
    },
    statLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    statIcon: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 16,
    },
    statName: {
        ...FONTS.medium,
        fontSize: 16,
        color: "#1e293b",
        marginBottom: 4,
    },
    statPercent: {
        ...FONTS.regular,
        fontSize: 13,
        color: "#64748b",
    },
    statValue: {
        ...FONTS.bold,
        fontSize: 16,
        color: "#1e293b",
    },
    statDivider: {
        height: 1,
        backgroundColor: "#e2e8f0",
        marginVertical: 4,
    },
    // Legacy styles for compatibility
    sectionDivider: {
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
        alignItems: "center",
    },
    sectionTitle: {
        ...FONTS.medium,
        fontSize: SIZES.large,
        color: COLORS.black,
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
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: SIZES.base,
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
    statHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: SIZES.padding * 3,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 2,
        marginHorizontal: SIZES.padding,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    loadingText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: "#112599",
        marginTop: SIZES.padding,
        textAlign: "center",
    },
    categoryLoadingContainer: {
        paddingVertical: SIZES.padding * 2,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyStateContainer: {
        paddingVertical: SIZES.padding * 2,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyStateText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: "#2c3e50",
        textAlign: "center",
    },
    emptyStateSubtext: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: "#8f92a1",
        marginTop: SIZES.base,
        textAlign: "center",
    },
});

export default StatisticsScreen;
