import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    useWindowDimensions,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "../theme";
import { RootStackParamList, Voucher, HomeSummaryPeriod } from "../types";
import { useVouchers } from "../context/VoucherContext";
import { useExpenses } from "../context/ExpenseContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import Carousel from "react-native-reanimated-carousel";
import { LinearGradient } from "expo-linear-gradient";
import { FocusAwareStatusBar } from "../components/focusAwareStatusBar";
import voucherService from "../services/voucherService";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { isLoading: vouchersLoading } = useVouchers();
    const { expenses, totalExpenses } = useExpenses();
    const { discountPercentage, monthStartDay } = useSettings();
    const [activeSlide, setActiveSlide] = useState(0);
    const [recentVouchers, setRecentVouchers] = useState<Voucher[]>([]);
    const [homePeriods, setHomePeriods] = useState<HomeSummaryPeriod[]>([]);
    const [loadingHomeSummary, setLoadingHomeSummary] = useState(false);
    const { width } = useWindowDimensions();

    // Load home summary (periods + recent vouchers) from server
    useEffect(() => {
        const loadHomeSummary = async () => {
            setLoadingHomeSummary(true);
            try {
                const summary = await voucherService.getHomeSummary(monthStartDay);
                setHomePeriods(summary.periods);
                setRecentVouchers(summary.recentVouchers);
            } catch (error) {
                console.error("Error loading home summary:", error);
                // Fallback to empty data
                setHomePeriods([]);
                setRecentVouchers([]);
            } finally {
                setLoadingHomeSummary(false);
            }
        };

        loadHomeSummary();
    }, [monthStartDay]); // Reload when monthStartDay changes

    // Helper for date formatting with proper capitalization
    const formatPtBrDate = (date: Date, formatString: string) => {
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "utc",
        });
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const navigateToVoucherDetails = (id: string) => {
        navigation.navigate("VoucherDetails", { id });
    };

    // Create carousel data from server response
    const carouselData = homePeriods.map((period, index) => ({
        title: period.title,
        dateRange: period.dateRange,
        value: period.value,
        displayText:
            index === 0 ? "Esse mês" : index === 1 ? "No próximo mês" : "Daqui a dois meses",
    }));

    return (
        <>
            <FocusAwareStatusBar backgroundColor="#000" animated style="light" />
            <View style={styles.container}>
                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <LinearGradient colors={["#000000", "#161616"]} style={styles.headerGradient}>
                        <SafeAreaView style={styles.safeArea}>
                            <View style={styles.header}>
                                <View style={styles.greetingContainer}>
                                    <Text style={styles.greeting}>Olá,</Text>
                                    <Text style={styles.name}>Marcondes 👋</Text>
                                    <Text style={styles.subtitle}>Bem-vindo de volta</Text>
                                </View>
                                <TouchableOpacity style={styles.profileButton}>
                                    <Icon
                                        name="account-circle"
                                        size={40}
                                        color="rgba(255,255,255,0.9)"
                                    />
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </LinearGradient>
                    <View style={styles.carouselContainer}>
                        {loadingHomeSummary ? (
                            <View style={styles.loadingCard}>
                                <ActivityIndicator size="large" color="#112599" />
                                <Text style={styles.loadingText}>Carregando seus vouchers...</Text>
                            </View>
                        ) : (
                            <>
                                <Carousel
                                    loop={false}
                                    width={width}
                                    height={210}
                                    data={carouselData}
                                    scrollAnimationDuration={1000}
                                    onSnapToItem={(index) => setActiveSlide(index)}
                                    renderItem={({ item, index }) => (
                                        <LinearGradient
                                            colors={["#112599", "#3841ef"]}
                                            style={styles.earningsCard}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <View style={styles.cardHeader}>
                                                <Icon
                                                    name="wallet"
                                                    size={24}
                                                    color="rgba(255,255,255,0.8)"
                                                />
                                                <Text style={styles.earningsLabel}>
                                                    Você vai receber
                                                </Text>
                                            </View>
                                            <Text style={styles.earningsValue}>
                                                {formatCurrency(
                                                    item.value - item.value * discountPercentage
                                                )}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.earningsPeriod,
                                                    { marginBottom: 20 },
                                                    { fontSize: 14 },
                                                ]}
                                            >
                                                {item.displayText}
                                            </Text>
                                            <View style={styles.cardFooter}>
                                                <Text style={styles.earningsPeriod}>
                                                    {item.title}
                                                </Text>
                                                <Text style={styles.dateRange}>
                                                    {item.dateRange}
                                                </Text>
                                            </View>
                                        </LinearGradient>
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
                            </>
                        )}
                    </View>

                    <View style={styles.recentContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.recentTitle}>Últimos Registros</Text>
                        </View>

                        {loadingHomeSummary ? (
                            <View style={styles.recentLoadingContainer}>
                                <ActivityIndicator size="large" color="#112599" />
                                <Text style={styles.loadingText}>Carregando registros...</Text>
                            </View>
                        ) : recentVouchers.length > 0 ? (
                            recentVouchers.map((voucher) => (
                                <TouchableOpacity
                                    key={voucher.id}
                                    style={styles.recentItem}
                                    onPress={() => navigateToVoucherDetails(voucher.id)}
                                >
                                    <View style={styles.recentItemLeft}>
                                        <View style={styles.voucherIcon}>
                                            <Icon name="receipt" size={20} color="#112599" />
                                        </View>
                                        <View>
                                            <Text style={styles.recentItemTitle}>Voucher</Text>
                                            <Text style={styles.recentItemSubtitle}>
                                                {voucher.taxNumber}
                                            </Text>
                                        </View>
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
                            ))
                        ) : (
                            <View style={styles.emptyStateContainer}>
                                <Icon name="receipt-text-outline" size={48} color="#8f92a1" />
                                <Text style={styles.emptyStateText}>Nenhum voucher encontrado</Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Seus registros aparecerão aqui
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    headerGradient: {
        paddingBottom: SIZES.padding * 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        marginTop: -SIZES.padding * 100,
        paddingTop: SIZES.padding * 100,
    },
    safeArea: {
        paddingHorizontal: SIZES.padding,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: SIZES.padding,
        paddingBottom: SIZES.padding,
    },
    greetingContainer: {
        flex: 1,
    },
    greeting: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: "rgba(255,255,255,0.8)",
    },
    name: {
        ...FONTS.bold,
        fontSize: SIZES.xxlarge,
        color: COLORS.white,
        marginTop: 4,
    },
    subtitle: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: "rgba(255,255,255,0.7)",
        marginTop: 2,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        flex: 1,
    },
    carouselContainer: {
        alignItems: "center",
        marginBottom: SIZES.padding * 2,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: SIZES.radius * 2,
        borderTopRightRadius: SIZES.radius * 2,
        zIndex: 10,
        marginTop: -SIZES.padding * 2,
        paddingTop: SIZES.padding * 2,
    },
    earningsCard: {
        marginHorizontal: 12,
        borderRadius: SIZES.radius * 2,
        padding: SIZES.padding * 1.5,
        height: "100%",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SIZES.base,
    },
    earningsLabel: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: "rgba(255,255,255,0.9)",
        marginLeft: SIZES.base,
    },
    earningsValue: {
        ...FONTS.bold,
        fontSize: SIZES.xxxlarge,
        color: COLORS.white,
        textAlign: "center",
        textShadowColor: "rgba(0,0,0,0.1)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    cardFooter: {
        alignItems: "center",
    },
    earningsPeriod: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: "rgba(255,255,255,0.8)",
        textAlign: "center",
    },
    dateRange: {
        ...FONTS.medium,
        fontSize: SIZES.small,
        color: "rgba(255,255,255,0.9)",
        marginTop: 4,
        textAlign: "center",
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
        backgroundColor: "rgba(0,0,0,0.2)",
        marginHorizontal: 4,
    },
    activeIndicator: {
        backgroundColor: "#112599",
        width: 24,
    },
    quickActionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: SIZES.padding,
        marginBottom: SIZES.padding * 2,
        gap: SIZES.padding / 2,
    },
    actionCard: {
        flex: 1,
        maxWidth: "31%", // Para comportar 3 cards por linha
        borderRadius: SIZES.radius * 1.5,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    actionGradient: {
        padding: SIZES.padding,
        alignItems: "center",
        minHeight: 100,
        justifyContent: "center",
    },
    actionTitle: {
        ...FONTS.bold,
        fontSize: SIZES.small,
        color: "white",
        marginTop: SIZES.base / 2,
        textAlign: "center",
    },
    actionSubtitle: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: "rgba(255,255,255,0.8)",
        marginTop: 2,
        textAlign: "center",
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
        paddingHorizontal: SIZES.padding,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SIZES.padding,
    },
    recentTitle: {
        ...FONTS.bold,
        fontSize: SIZES.large,
        color: "#2c3e50",
    },
    seeAllButton: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: "#112599",
    },
    recentItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 1.5,
        padding: SIZES.padding,
        marginBottom: SIZES.base,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    recentItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    voucherIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(17, 37, 153, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: SIZES.padding,
    },
    recentItemTitle: {
        ...FONTS.medium,
        fontSize: SIZES.small,
        color: "#8f92a1",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    recentItemSubtitle: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: "#2c3e50",
        marginTop: 2,
    },
    recentItemRight: {
        alignItems: "flex-end",
    },
    recentItemPrice: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: "#27ae60",
    },
    recentItemDate: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: "#8f92a1",
        marginTop: 2,
    },
    loadingCard: {
        height: 210,
        margin: SIZES.padding,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 2,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    loadingText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: "#112599",
        marginTop: SIZES.padding,
        textAlign: "center",
    },
    recentLoadingContainer: {
        paddingVertical: SIZES.padding * 2,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyStateContainer: {
        paddingVertical: SIZES.padding * 3,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 1.5,
        marginTop: SIZES.padding,
    },
    emptyStateText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: "#2c3e50",
        marginTop: SIZES.padding,
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

export default HomeScreen;
