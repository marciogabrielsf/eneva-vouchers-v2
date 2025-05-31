import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Voucher } from "../types";
import { COLORS, FONTS, SIZES } from "../theme";
import { useVouchers } from "../context/VoucherContext";
import MonthSelector from "../components/MonthSelector";
import VoucherItem from "../components/VoucherItem";
import AddButton from "../components/AddButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
type VoucherScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

    const renderVoucherItem = ({ item }: { item: Voucher }) => (
        <VoucherItem voucher={item} onPress={handleVoucherPress} />
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

            <MonthSelector
                currentDate={currentMonthDate}
                onMonthChange={handleMonthChange}
                disabled={isLoading}
                customDateRangeLabel={getMonthRangeLabel()}
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.black} />
                    <Text style={styles.loadingText}>Carregando vouchers...</Text>
                </View>
            )}

            {filteredVouchers.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Nenhum voucher encontrado para este período
                    </Text>
                </View>
            ) : (
                !isLoading && (
                    <FlatList
                        data={filteredVouchers}
                        ListHeaderComponent={
                            <View style={styles.totalContainer}>
                                <Text style={styles.totalLabel}>Subtotal de recebimentos:</Text>
                                <Text style={styles.totalValue}>
                                    {totalEarnings.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    })}
                                </Text>
                                <Text style={styles.totalLabel}>Valor Descontado:</Text>
                                <Text style={styles.discountedValue}>
                                    {(
                                        totalEarnings -
                                        totalEarnings * discountPercentage
                                    ).toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    })}
                                </Text>
                            </View>
                        }
                        keyExtractor={(item) => item.id}
                        renderItem={renderVoucherItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )
            )}

            <AddButton onPress={handleAddVoucher} disabled={isLoading} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
    },
    loadingText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.black,
        marginTop: SIZES.base,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: SIZES.padding,
    },
    emptyText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.gray,
        textAlign: "center",
    },
});

export default VouchersScreen;
