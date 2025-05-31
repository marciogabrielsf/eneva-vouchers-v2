import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { COLORS, FONTS, SIZES } from "../theme";
import useEarningsStatistics from "../hooks/useEarningsStatistics";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";

interface EarningsChartProps {
    startDate?: Date;
    endDate?: Date;
}

const EarningsChart: React.FC<EarningsChartProps> = ({ startDate, endDate }) => {
    const { data, loading, error, refetch } = useEarningsStatistics(startDate, endDate);

    const screenWidth = Dimensions.get("window").width;
    const chartWidth = screenWidth - SIZES.padding * 2;

    const formatCurrency = (value: number) => {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
        });
    };

    const getChartData = () => {
        if (!data || data.data.length === 0) {
            return {
                labels: ["Sem dados"],
                datasets: [
                    {
                        data: [0],
                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                        strokeWidth: 2,
                    },
                ],
            };
        }

        // Limit the number of labels to avoid overcrowding
        const maxLabels = 6;
        const stepSize = Math.ceil(data.data.length / maxLabels);

        const labels = data.data
            .filter(
                (_: any, index: number) => index % stepSize === 0 || index === data.data.length - 1
            )
            .map((item: any) => formatDate(item.date));

        const values = data.data
            .filter(
                (_: any, index: number) => index % stepSize === 0 || index === data.data.length - 1
            )
            .map((item: any) => item.value);

        return {
            labels,
            datasets: [
                {
                    data: values,
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    strokeWidth: 3,
                },
            ],
        };
    };

    const chartConfig: AbstractChartConfig = {
        backgroundColor: COLORS.white,
        backgroundGradientFrom: COLORS.white,
        backgroundGradientTo: COLORS.white,

        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: SIZES.radius,
        },
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: COLORS.green,
        },
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.green} />
                <Text style={styles.loadingText}>Carregando dados...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Evolução dos Ganhos</Text>
                {data && (
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Total do Período</Text>
                            <Text style={styles.summaryValue}>
                                {formatCurrency(data.summary.totalEarnings)}
                            </Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Vouchers</Text>
                            <Text style={styles.summaryValue}>{data.summary.voucherCount}</Text>
                        </View>
                    </View>
                )}
            </View>

            {data && data.data.length > 0 ? (
                <View style={styles.chartContainer}>
                    <LineChart
                        data={getChartData()}
                        width={chartWidth}
                        height={200}
                        chartConfig={chartConfig}
                        bezier
                        formatYLabel={(value: string) => {
                            const numValue = parseFloat(value);
                            if (numValue >= 1000) {
                                return `R$${(numValue / 1000).toFixed(1)}k`;
                            }
                            return `R$${numValue.toFixed()}`;
                        }}
                        fromZero={true}
                        style={styles.chart}
                        withInnerLines={false}
                        withOuterLines={true}
                        withHorizontalLabels={true}
                        withVerticalLabels={true}
                        yAxisInterval={1}
                        segments={4}
                    />
                </View>
            ) : (
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>
                        Nenhum dado disponível para o período selecionado
                    </Text>
                </View>
            )}

            {data && (
                <View style={styles.periodInfo}>
                    <Text style={styles.periodText}>
                        Período: {new Date(data.summary.period.from).toLocaleDateString("pt-BR")} -{" "}
                        {new Date(data.summary.period.to).toLocaleDateString("pt-BR")}
                    </Text>
                    <Text style={styles.intervalText}>
                        Intervalo: {data.summary.intervalDays} dia(s)
                    </Text>
                </View>
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
    header: {
        marginBottom: SIZES.padding,
    },
    title: {
        ...FONTS.medium,
        fontSize: SIZES.large,
        color: COLORS.black,
        marginBottom: SIZES.base,
    },
    summaryContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    summaryItem: {
        flex: 1,
        alignItems: "center",
    },
    summaryLabel: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.gray,
        marginBottom: 2,
    },
    summaryValue: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: COLORS.green,
    },
    chartContainer: {
        alignItems: "center",
        marginVertical: SIZES.base,
    },
    chart: {
        marginVertical: 8,
        borderRadius: SIZES.radius,
    },
    loadingContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding * 2,
        marginHorizontal: SIZES.padding,
        marginVertical: SIZES.base,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    loadingText: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.gray,
        marginTop: SIZES.base,
    },
    errorContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginHorizontal: SIZES.padding,
        marginVertical: SIZES.base,
        alignItems: "center",
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    errorText: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.red,
        textAlign: "center",
        marginBottom: SIZES.padding,
    },
    retryButton: {
        backgroundColor: COLORS.green,
        borderRadius: SIZES.radius / 2,
        paddingVertical: SIZES.base,
        paddingHorizontal: SIZES.padding,
    },
    retryButtonText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.white,
    },
    noDataContainer: {
        paddingVertical: SIZES.padding * 2,
        alignItems: "center",
    },
    noDataText: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.gray,
        textAlign: "center",
    },
    periodInfo: {
        marginTop: SIZES.base,
        paddingTop: SIZES.base,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        alignItems: "center",
    },
    periodText: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.gray,
        marginBottom: 2,
    },
    intervalText: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.gray,
    },
});

export default EarningsChart;
