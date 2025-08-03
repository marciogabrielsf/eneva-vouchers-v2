import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { COLORS, FONTS, SIZES } from "../theme";
import { RootStackParamList, Voucher } from "../types";
import { useVouchers } from "../context/VoucherContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { FocusAwareStatusBar } from "../components/focusAwareStatusBar";
import { formatCurrency } from "../utils/formatters";
import { useLoadingState } from "../hooks/common";

type VoucherDetailsRouteProp = RouteProp<RootStackParamList, "VoucherDetails">;
type VoucherDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const VoucherDetailsScreen = () => {
    const navigation = useNavigation<VoucherDetailsNavigationProp>();
    const route = useRoute<VoucherDetailsRouteProp>();
    const { getVoucherById, deleteVoucher, isLoading, error } = useVouchers();
    const [voucher, setVoucher] = useState<Voucher | undefined>(undefined);
    const { isLoading: deleting, setLoadingState: setDeleting } = useLoadingState();

    const { id } = route.params;

    useEffect(() => {
        const fetchedVoucher = getVoucherById(id);
        setVoucher(fetchedVoucher);
    }, [id, getVoucherById]);

    // Show error alert if delete operation fails
    useEffect(() => {
        if (error && deleting) {
            Alert.alert("Erro", error);
            setDeleting(false);
        }
    }, [error, deleting, setDeleting]);

    const handleEdit = useCallback(() => {
        if (voucher) {
            navigation.navigate("VoucherForm", { voucher });
        }
    }, [voucher, navigation]);

    const handleDelete = useCallback(() => {
        Alert.alert("Excluir Voucher", "Tem certeza que deseja excluir este voucher?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                    if (voucher) {
                        setDeleting(true);
                        try {
                            await deleteVoucher(voucher.id);
                            navigation.goBack();
                        } catch (err) {
                            // Error is handled by the useEffect that watches error state
                        }
                    }
                },
            },
        ]);
    }, [voucher, setDeleting, deleteVoucher, navigation]);

    const getCategoryName = useCallback((code: string) => {
        const category = code.substring(0, 3);
        switch (category) {
            case "MAN":
                return "Manutenção";
            case "TRN":
                return "Transporte";
            case "DEL":
                return "Entrega";
            default:
                return category;
        }
    }, []);

    if (isLoading || deleting) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.black} />
                <Text style={styles.loadingText}>
                    {deleting ? "Excluindo voucher..." : "Carregando detalhes do voucher..."}
                </Text>
            </View>
        );
    }

    if (!voucher) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Voucher não encontrado</Text>
                <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.goBackButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <FocusAwareStatusBar backgroundColor="#000" style="light" />

            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Detalhes do Voucher</Text>
                        <Text style={styles.headerCategory}>
                            {getCategoryName(voucher.requestCode)}
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={styles.infoItem}>
                                <Text style={styles.label}>Número Fiscal</Text>
                                <Text style={styles.value}>{voucher.taxNumber}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.label}>Código de Solicitação</Text>
                                <Text style={styles.value}>{voucher.requestCode}</Text>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.infoItem}>
                                <Text style={styles.label}>Data</Text>
                                <Text style={styles.value}>
                                    {format(new Date(voucher.date), "dd/MM/yyyy")}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.label}>Valor</Text>
                                <Text style={styles.valueHighlight}>
                                    {formatCurrency(voucher.value)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.locationSection}>
                            <Text style={styles.label}>Local de Origem</Text>
                            <Text style={styles.locationText}>{voucher.start}</Text>
                        </View>

                        <View style={styles.locationSection}>
                            <Text style={styles.label}>Destino</Text>
                            <Text style={styles.locationText}>{voucher.destination}</Text>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={handleEdit}
                        >
                            <Icon name="pencil" size={20} color={COLORS.white} />
                            <Text style={styles.actionButtonText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={handleDelete}
                        >
                            <Icon name="delete" size={20} color={COLORS.white} />
                            <Text style={styles.actionButtonText}>Excluir</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
        padding: SIZES.padding,
    },
    loadingText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.black,
        marginTop: SIZES.padding,
    },
    goBackButton: {
        backgroundColor: COLORS.black,
        paddingVertical: SIZES.padding,
        paddingHorizontal: SIZES.padding * 2,
        borderRadius: SIZES.radius,
        marginTop: SIZES.padding,
    },
    goBackButtonText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.white,
    },
    header: {
        padding: SIZES.padding,
    },
    headerTitle: {
        ...FONTS.bold,
        fontSize: SIZES.xxlarge,
        color: COLORS.black,
    },
    headerCategory: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.gray,
        marginTop: SIZES.base,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        margin: SIZES.padding,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: SIZES.padding,
    },
    infoItem: {
        flex: 1,
    },
    label: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.gray,
        marginBottom: 4,
    },
    value: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.black,
    },
    valueHighlight: {
        ...FONTS.bold,
        fontSize: SIZES.large,
        color: COLORS.green,
    },
    locationSection: {
        marginBottom: SIZES.padding,
    },
    locationText: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.black,
        lineHeight: 22,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: SIZES.padding,
        marginBottom: SIZES.padding * 2,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        flex: 1,
        marginHorizontal: SIZES.base,
    },
    editButton: {
        backgroundColor: COLORS.black,
    },
    deleteButton: {
        backgroundColor: COLORS.red,
    },
    actionButtonText: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: COLORS.white,
        marginLeft: SIZES.base,
    },
});

export default VoucherDetailsScreen;
