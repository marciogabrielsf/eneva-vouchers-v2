import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Animated,
    RefreshControl,
    Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Voucher } from "../types";
import { COLORS, FONTS, SIZES } from "../theme";
import { useVouchers } from "../context/VoucherContext";
import MonthSelector from "../components/MonthSelector";
import VoucherItem from "../components/VoucherItem";
import AddButton from "../components/AddButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import { LinearGradient } from "expo-linear-gradient";
import { FocusAwareStatusBar } from "../components/focusAwareStatusBar";
type VoucherScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");

const VouchersScreen = () => {
    const navigation = useNavigation<VoucherScreenNavigationProp>();
    const {
        filteredVouchers,
        currentMonthDate,
        setCurrentMonthDate,
        totalEarnings,
        isLoading,
        error,
        loadVouchers,
        getMonthRangeLabel,
    } = useVouchers();

    const { discountPercentage } = useSettings();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const [refreshing, setRefreshing] = useState(false);

    // Use a ref to track if initial data has been loaded to prevent multiple loads
    const initialLoadDone = useRef(false);

    // Instead of using useFocusEffect, use a regular useEffect with an isMounted ref
    // to ensure we don't make API calls after component unmounts
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            // Clean up when component unmounts
            isMounted.current = false;
        };
    }, []);

    // Load data once when component mounts
    useEffect(() => {
        if (!initialLoadDone.current && !isLoading && filteredVouchers.length === 0) {
            // Only load if we haven't loaded before, aren't currently loading, and have no data
            initialLoadDone.current = true;
            loadVouchers();
        }

        // Animate entrance
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, [filteredVouchers.length, isLoading]);

    const handleMonthChange = (date: Date) => {
        setCurrentMonthDate(date);
        // The loadVouchers will be triggered by the useEffect in VoucherContext
        // that watches currentMonthDate changesw
    };

    const handleVoucherPress = (voucher: Voucher) => {
        navigation.navigate("VoucherDetails", { id: voucher.id });
    };

    const handleAddVoucher = () => {
        navigation.navigate("VoucherForm", {});
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadVouchers();
        setRefreshing(false);
    };

    const renderVoucherItem = ({ item }: { item: Voucher }) => (
        <VoucherItem voucher={item} onPress={handleVoucherPress} />
    );

    return (
        <>
            <FocusAwareStatusBar backgroundColor="#000" animated style="light" />
            <View style={styles.container}>
                <LinearGradient colors={["#000000", "#161616"]} style={styles.headerGradient}>
                    <SafeAreaView style={styles.safeArea}>
                        <Animated.View
                            style={[
                                styles.headerContent,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
                            <Text style={styles.headerTitle}>Vouchers</Text>
                            <Text style={styles.headerSubtitle}>Gerencie seus recebimentos</Text>
                        </Animated.View>
                    </SafeAreaView>
                </LinearGradient>

                <View style={styles.contentContainer}>
                    <MonthSelector
                        currentDate={currentMonthDate}
                        onMonthChange={handleMonthChange}
                        disabled={isLoading}
                        customDateRangeLabel={getMonthRangeLabel()}
                    />

                    {isLoading && !refreshing && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#667eea" />
                            <Text style={styles.loadingText}>Carregando vouchers...</Text>
                        </View>
                    )}

                    {filteredVouchers.length === 0 && !isLoading ? (
                        <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
                            <View style={styles.emptyIconContainer}>
                                <Text style={styles.emptyIcon}>📄</Text>
                            </View>
                            <Text style={styles.emptyTitle}>Nenhum voucher encontrado</Text>
                            <Text style={styles.emptySubtitle}>
                                Não há vouchers para este período
                            </Text>
                        </Animated.View>
                    ) : (
                        !isLoading && (
                            <FlatList
                                data={filteredVouchers}
                                ListHeaderComponent={
                                    <View style={styles.statsContainer}>
                                        <LinearGradient
                                            colors={["#ffffff", "#f8f9ff"]}
                                            style={styles.totalCard}
                                        >
                                            <View style={styles.statRow}>
                                                <View style={styles.statItem}>
                                                    <Text style={styles.statLabel}>Subtotal</Text>
                                                    <Text style={styles.statValue}>
                                                        {totalEarnings.toLocaleString("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        })}
                                                    </Text>
                                                </View>
                                                <View style={styles.statDivider} />
                                                <View style={styles.statItem}>
                                                    <Text style={styles.statLabel}>Líquido</Text>
                                                    <Text style={styles.statValueHighlight}>
                                                        {(
                                                            totalEarnings -
                                                            totalEarnings * discountPercentage
                                                        ).toLocaleString("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        })}
                                                    </Text>
                                                </View>
                                            </View>
                                        </LinearGradient>
                                    </View>
                                }
                                windowSize={11}
                                initialNumToRender={3}
                                removeClippedSubviews
                                keyExtractor={(item) => item.id}
                                renderItem={renderVoucherItem}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={["#667eea"]}
                                        tintColor="#667eea"
                                    />
                                }
                            />
                        )
                    )}

                    <AddButton onPress={handleAddVoucher} disabled={isLoading} />
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },
    headerGradient: {
        paddingBottom: SIZES.padding * 2,
    },
    safeArea: {
        paddingHorizontal: SIZES.padding,
    },
    headerContent: {
        paddingTop: SIZES.padding,
    },
    headerTitle: {
        ...FONTS.bold,
        fontSize: SIZES.xxxlarge,
        color: COLORS.white,
        marginBottom: SIZES.base / 2,
    },
    headerSubtitle: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: "rgba(255, 255, 255, 0.8)",
    },
    contentContainer: {
        flex: 1,
        marginTop: -SIZES.padding,
        borderTopLeftRadius: SIZES.radius * 2,
        borderTopRightRadius: SIZES.radius * 2,
        backgroundColor: "#f5f6fa",
        paddingTop: SIZES.padding,
    },
    statsContainer: {
        paddingHorizontal: SIZES.padding,
        marginBottom: SIZES.padding,
    },
    totalCard: {
        borderRadius: SIZES.radius * 1.5,
        padding: SIZES.padding * 1.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    statRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: "rgba(102, 126, 234, 0.2)",
        marginHorizontal: SIZES.padding,
    },
    statLabel: {
        ...FONTS.medium,
        fontSize: SIZES.small,
        color: "#8f92a1",
        marginBottom: SIZES.base / 2,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    statValue: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: "#2c3e50",
    },
    statValueHighlight: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: "#667eea",
    },
    totalContainer: {
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
    totalLabel: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.gray,
    },
    totalValue: {
        ...FONTS.bold,
        fontSize: SIZES.xlarge,
        color: COLORS.black,
        marginBottom: SIZES.base,
    },
    discountedValue: {
        ...FONTS.bold,
        fontSize: SIZES.xlarge,
        color: COLORS.green,
    },
    listContent: {
        paddingBottom: 100, // Extra space at bottom for add button
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: SIZES.padding * 2,
    },
    loadingText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: "#667eea",
        marginTop: SIZES.padding,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: SIZES.padding * 2,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SIZES.padding,
    },
    emptyIcon: {
        fontSize: 40,
    },
    emptyTitle: {
        ...FONTS.bold,
        fontSize: SIZES.large,
        color: "#2c3e50",
        marginBottom: SIZES.base,
        textAlign: "center",
    },
    emptySubtitle: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: "#8f92a1",
        textAlign: "center",
        lineHeight: 22,
    },
    emptyText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.gray,
        textAlign: "center",
    },
});

export default VouchersScreen;
