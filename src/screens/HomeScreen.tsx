import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    useWindowDimensions,
    StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { format, addMonths, subMonths, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { COLORS, FONTS, SIZES } from "../theme";
import { RootStackParamList } from "../types";
import { useVouchers } from "../context/VoucherContext";
import VoucherItem from "../components/VoucherItem";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import Carousel from "react-native-reanimated-carousel";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { vouchers, currentMonthDate } = useVouchers();
    const { discountPercentage, monthStartDay } = useSettings();
    const [activeSlide, setActiveSlide] = useState(0);
    const { width } = useWindowDimensions();

    const actualDate = new Date();

    // Helper function to get custom month date range based on monthStartDay
    const getCustomMonthDateRange = (baseDate: Date, monthsOffset: number) => {
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth() + monthsOffset;

        // Create start date based on monthStartDay
        const startDate = startOfDay(new Date(year, month, monthStartDay));

        // End date is one day before the start date of the next month
        const endDate = endOfDay(new Date(year, month + 1, monthStartDay));
        endDate.setDate(endDate.getDate() - 1);

        return { startDate, endDate };
    };

    // Filter vouchers for each month period
    const firstMonthVouchers = vouchers.filter((voucher) => {
        const voucherDate = new Date(voucher.date);
        const { startDate, endDate } = getCustomMonthDateRange(actualDate, -2);
        return voucherDate >= startDate && voucherDate <= endDate;
    });

    const secondMonthVouchers = vouchers.filter((voucher) => {
        const voucherDate = new Date(voucher.date);
        const { startDate, endDate } = getCustomMonthDateRange(actualDate, -1);
        return voucherDate >= startDate && voucherDate <= endDate;
    });

    const thirdMonthVouchers = vouchers.filter((voucher) => {
        const voucherDate = new Date(voucher.date);
        const { startDate, endDate } = getCustomMonthDateRange(actualDate, 0);
        return voucherDate >= startDate && voucherDate <= endDate;
    });

    const formatCurrency = (value: number) => {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const navigateToVoucherDetails = (id: string) => {
        navigation.navigate("VoucherDetails", { id });
    };

    const recentVouchers = vouchers
        .slice(-5)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Show just the last 5 vouchers on home screen

    // Helper for date formatting with proper capitalization
    const formatPtBrDate = (date: Date, formatString: string) => {
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "utc",
        });
    };

    // Helper function to get a label for each month period
    const getMonthLabel = (date: Date, monthsToAdd: number) => {
        const periodDate = addMonths(date, monthsToAdd);

        if (monthsToAdd === 0) {
            return "Este mês";
        } else if (monthsToAdd === 1) {
            return "Próximo mês";
        } else {
            return `Daqui a ${monthsToAdd} meses`;
        }
    };

    // Format date range for display
    const formatDateRange = (offsetMonths: number) => {
        const { startDate, endDate } = getCustomMonthDateRange(actualDate, offsetMonths);
        return `${formatPtBrDate(startDate, "dd 'de' MMM")} - ${formatPtBrDate(
            endDate,
            "dd 'de' MMM"
        )}`;
    };

    // Helper function for projected earnings - just an example
    const getProjectedEarnings = (baseEarnings: number, monthsAhead: number) => {
        // This is a simple projection example - you might want to implement a more sophisticated model
        const growthFactor = 1 + 0.1 * monthsAhead;
        return baseEarnings * growthFactor;
    };

    const carouselData = [
        {
            title: "Referente aos vouchers de",
            dateRange: formatDateRange(-2),
            value: firstMonthVouchers.reduce((acc, voucher) => acc + voucher.value, 0),
        },
        {
            title: "Referente aos vouchers de",
            dateRange: formatDateRange(-1),
            value: secondMonthVouchers.reduce((acc, voucher) => acc + voucher.value, 0),
        },
        {
            title: "Referente aos vouchers de",
            dateRange: formatDateRange(0),
            value: thirdMonthVouchers.reduce((acc, voucher) => acc + voucher.value, 0),
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

            <ScrollView>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Olá,</Text>
                        <Text style={styles.name}>Marcondes</Text>
                    </View>
                </View>

                <View style={styles.carouselContainer}>
                    <Carousel
                        loop={false}
                        width={width}
                        height={150}
                        data={carouselData}
                        scrollAnimationDuration={1000}
                        onSnapToItem={(index) => setActiveSlide(index)}
                        renderItem={({ item, index }) => (
                            <View style={styles.earningsCard}>
                                <Text style={styles.earningsLabel}>Você vai receber</Text>
                                <Text style={styles.earningsValue}>
                                    {formatCurrency(item.value - item.value * discountPercentage)}
                                </Text>
                                <Text style={styles.earningsPeriod}>{item.title}</Text>
                                <Text style={styles.dateRange}>{item.dateRange}</Text>
                            </View>
                        )}
                    />
                    <View style={styles.indicators}>
                        {carouselData.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.indicator,
                                    activeSlide === index && styles.activeIndicator,
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate("Vouchers")}
                    >
                        <View style={styles.menuIcon}>
                            <Icon name="receipt" size={30} color={COLORS.black} />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Vouchers</Text>
                            <Text style={styles.menuSubtitle}>Vouchers Mensais, tabelas</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color={COLORS.black} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate("Statistics")}
                    >
                        <View style={styles.menuIcon}>
                            <Icon name="chart-pie" size={30} color={COLORS.black} />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Estatísticas</Text>
                            <Text style={styles.menuSubtitle}>Faturamento, descontos</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color={COLORS.black} />
                    </TouchableOpacity>
                </View>

                <View style={styles.recentContainer}>
                    <Text style={styles.recentTitle}>Últimos Registros</Text>

                    {recentVouchers.map((voucher) => (
                        <TouchableOpacity
                            key={voucher.id}
                            style={styles.recentItem}
                            onPress={() => navigateToVoucherDetails(voucher.id)}
                        >
                            <View>
                                <Text style={styles.recentItemTitle}>Voucher</Text>
                                <Text style={styles.recentItemSubtitle}>
                                    {voucher.taxNumber} - {voucher.requestCode.substring(4)}
                                </Text>
                            </View>
                            <View style={styles.recentItemRight}>
                                <Text style={styles.recentItemPrice}>
                                    {formatCurrency(voucher.value)}
                                </Text>
                                <Text style={styles.recentItemDate}>
                                    {formatPtBrDate(
                                        new Date(voucher.date),
                                        "dd 'de' MMMM 'de' yyyy"
                                    )}
                                </Text>
                            </View>
                        </TouchableOpacity>
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: SIZES.padding,
        paddingTop: SIZES.padding * 2,
        paddingBottom: SIZES.padding,
    },
    greeting: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.black,
    },
    name: {
        ...FONTS.bold,
        fontSize: SIZES.xxlarge,
        color: COLORS.black,
    },
    carouselContainer: {
        alignItems: "center",
        marginBottom: SIZES.padding,
    },
    earningsCard: {
        marginHorizontal: 10,
        backgroundColor: COLORS.black,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        height: "100%",
        justifyContent: "center",
    },
    earningsLabel: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.white,
    },
    earningsValue: {
        ...FONTS.bold,
        fontSize: SIZES.xxlarge,
        color: COLORS.green,
        marginTop: SIZES.base,
        marginBottom: SIZES.base,
    },
    earningsPeriod: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.white,
        // marginBottom: SIZES.padding,
    },
    dateRange: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.lightGray,
        marginTop: 2,
    },
    indicators: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: SIZES.padding,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.gray,
        marginHorizontal: 4,
    },
    activeIndicator: {
        backgroundColor: COLORS.black,
        width: 16,
    },
    menuContainer: {
        marginVertical: SIZES.padding,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginHorizontal: SIZES.padding,
        marginBottom: SIZES.padding,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    menuIcon: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: COLORS.lightGray,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SIZES.padding,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.black,
    },
    menuSubtitle: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.gray,
        marginTop: 2,
    },
    recentContainer: {
        marginBottom: SIZES.padding * 4,
    },
    recentTitle: {
        ...FONTS.medium,
        fontSize: SIZES.large,
        color: COLORS.black,
        marginHorizontal: SIZES.padding,
        marginBottom: SIZES.padding,
    },
    recentItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginHorizontal: SIZES.padding,
        marginBottom: SIZES.base,
    },
    recentItemTitle: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.gray,
    },
    recentItemSubtitle: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.black,
        marginTop: 2,
    },
    recentItemRight: {
        alignItems: "flex-end",
    },
    recentItemPrice: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: COLORS.green,
    },
    recentItemDate: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.gray,
        marginTop: 2,
    },
});

export default HomeScreen;
