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
import { RootStackParamList, Expense } from "../types";
import { COLORS, FONTS, SIZES } from "../theme";
import { useExpenses } from "../context/ExpenseContext";
import MonthSelector from "../components/MonthSelector";
import ExpenseItem from "../components/ExpenseItem";
import AddButton from "../components/AddButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FocusAwareStatusBar } from "../components/focusAwareStatusBar";

type ExpenseScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExpensesScreen = () => {
    const navigation = useNavigation<ExpenseScreenNavigationProp>();
    const {
        filteredExpenses,
        currentMonthDate,
        setCurrentMonthDate,
        totalExpenses,
        isLoading,
        error,
        loadExpenses,
        getMonthRangeLabel,
    } = useExpenses();

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
        if (!initialLoadDone.current && !isLoading && filteredExpenses.length === 0) {
            // Only load if we haven't loaded before, aren't currently loading, and have no data
            initialLoadDone.current = true;
            loadExpenses();
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
    }, [filteredExpenses.length, isLoading]);

    const handleMonthChange = (date: Date) => {
        setCurrentMonthDate(date);
        // The loadExpenses will be triggered by the useEffect in ExpenseContext
        // that watches currentMonthDate changes
    };

    const handleExpensePress = (expense: Expense) => {
        navigation.navigate("ExpenseDetails", { id: expense.id });
    };

    const handleAddExpense = () => {
        navigation.navigate("ExpenseForm", {});
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadExpenses();
        setRefreshing(false);
    };

    const renderExpenseItem = ({ item }: { item: Expense }) => (
        <ExpenseItem expense={item} onPress={handleExpensePress} />
    );

    return (
        <>
            <FocusAwareStatusBar backgroundColor="#8B0000" animated style="light" />
            <View style={styles.container}>
                <LinearGradient colors={["#8B0000", "#A52A2A"]} style={styles.headerGradient}>
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
                            <Text style={styles.headerTitle}>Despesas</Text>
                            <Text style={styles.headerSubtitle}>Controle seus gastos</Text>
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
                            <ActivityIndicator size="large" color="#FF6B6B" />
                            <Text style={styles.loadingText}>Carregando despesas...</Text>
                        </View>
                    )}

                    {filteredExpenses.length === 0 && !isLoading ? (
                        <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
                            <View style={styles.emptyIconContainer}>
                                <Text style={styles.emptyIcon}>💸</Text>
                            </View>
                            <Text style={styles.emptyTitle}>Nenhuma despesa encontrada</Text>
                            <Text style={styles.emptySubtitle}>
                                Não há despesas para este período
                            </Text>
                        </Animated.View>
                    ) : (
                        !isLoading && (
                            <FlatList
                                data={filteredExpenses}
                                ListHeaderComponent={
                                    <View style={styles.statsContainer}>
                                        <LinearGradient
                                            colors={["#ffffff", "#fff8f8"]}
                                            style={styles.totalCard}
                                        >
                                            <View style={styles.statRow}>
                                                <View style={styles.statItem}>
                                                    <Text style={styles.statLabel}>
                                                        Total de Despesas
                                                    </Text>
                                                    <Text style={styles.statValue}>
                                                        {totalExpenses.toLocaleString("pt-BR", {
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
                                renderItem={renderExpenseItem}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={["#FF6B6B"]}
                                        tintColor="#FF6B6B"
                                    />
                                }
                            />
                        )
                    )}

                    <AddButton onPress={handleAddExpense} disabled={isLoading} />
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
        justifyContent: "center",
    },
    statItem: {
        alignItems: "center",
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
        color: "#FF6B6B",
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
        color: "#FF6B6B",
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
        backgroundColor: "rgba(255, 107, 107, 0.1)",
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
});

export default ExpensesScreen;
