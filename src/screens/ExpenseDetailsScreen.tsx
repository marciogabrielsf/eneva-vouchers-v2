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
import { COLORS, FONTS, SIZES } from "../theme";
import { RootStackParamList, Expense, ExpenseCategory } from "../types";
import { useExpenses } from "../context/ExpenseContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { FocusAwareStatusBar } from "../components/focusAwareStatusBar";
import { formatCurrency } from "../utils/formatters";
import { useLoadingState } from "../hooks/common";

type ExpenseDetailsRouteProp = RouteProp<RootStackParamList, "ExpenseDetails">;
type ExpenseDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExpenseDetailsScreen = () => {
    const navigation = useNavigation<ExpenseDetailsNavigationProp>();
    const route = useRoute<ExpenseDetailsRouteProp>();
    const { getExpenseById, deleteExpense, isLoading, error } = useExpenses();
    const [expense, setExpense] = useState<Expense | undefined>(undefined);
    const { isLoading: deleting, setLoadingState: setDeleting } = useLoadingState();

    const { id } = route.params;

    useEffect(() => {
        const fetchedExpense = getExpenseById(id);
        setExpense(fetchedExpense);
    }, [id, getExpenseById]);

    // Show error alert if delete operation fails
    useEffect(() => {
        if (error && deleting) {
            Alert.alert("Erro", error);
            setDeleting(false);
        }
    }, [error, deleting, setDeleting]);

    const handleEdit = useCallback(() => {
        if (expense) {
            navigation.navigate("ExpenseForm", { expense });
        }
    }, [expense, navigation]);

    const handleDelete = useCallback(() => {
        Alert.alert("Excluir Despesa", "Tem certeza que deseja excluir esta despesa?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                    if (expense) {
                        setDeleting(true);
                        try {
                            await deleteExpense(expense.id);
                            navigation.goBack();
                        } catch (err) {
                            // Error is handled by the useEffect that watches error state
                        }
                    }
                },
            },
        ]);
    }, [expense, setDeleting, deleteExpense, navigation]);

    const getCategoryName = useCallback((category: ExpenseCategory) => {
        const categoryNames: Record<ExpenseCategory, string> = {
            [ExpenseCategory.FOOD]: "Alimentação",
            [ExpenseCategory.TRANSPORT]: "Transporte",
            [ExpenseCategory.HOUSING]: "Moradia",
            [ExpenseCategory.ENTERTAINMENT]: "Entretenimento",
            [ExpenseCategory.HEALTHCARE]: "Saúde",
            [ExpenseCategory.EDUCATION]: "Educação",
            [ExpenseCategory.UTILITIES]: "Utilidades",
            [ExpenseCategory.SHOPPING]: "Compras",
            [ExpenseCategory.OTHER]: "Outros",
        };
        return categoryNames[category] || category;
    }, []);

    const getCategoryColor = useCallback((category: ExpenseCategory) => {
        const categoryColors: Record<ExpenseCategory, string> = {
            [ExpenseCategory.FOOD]: "#FF6B6B",
            [ExpenseCategory.TRANSPORT]: "#4ECDC4",
            [ExpenseCategory.HOUSING]: "#45B7D1",
            [ExpenseCategory.ENTERTAINMENT]: "#96CEB4",
            [ExpenseCategory.HEALTHCARE]: "#FFEAA7",
            [ExpenseCategory.EDUCATION]: "#DDA0DD",
            [ExpenseCategory.UTILITIES]: "#98D8C8",
            [ExpenseCategory.SHOPPING]: "#F7DC6F",
            [ExpenseCategory.OTHER]: "#BDC3C7",
        };
        return categoryColors[category] || "#BDC3C7";
    }, []);

    if (isLoading || deleting) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
                <Text style={styles.loadingText}>
                    {deleting ? "Excluindo despesa..." : "Carregando detalhes da despesa..."}
                </Text>
            </View>
        );
    }

    if (!expense) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Despesa não encontrada</Text>
                <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.goBackButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <FocusAwareStatusBar backgroundColor="#8B0000" style="light" />

            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Detalhes da Despesa</Text>
                        <View
                            style={[
                                styles.categoryBadge,
                                { backgroundColor: getCategoryColor(expense.category) + "20" },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.headerCategory,
                                    { color: getCategoryColor(expense.category) },
                                ]}
                            >
                                {getCategoryName(expense.category)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={styles.infoItem}>
                                <Text style={styles.label}>Categoria</Text>
                                <Text style={styles.value}>
                                    {getCategoryName(expense.category)}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.label}>Data</Text>
                                <Text style={styles.value}>
                                    {format(new Date(expense.date), "dd/MM/yyyy")}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.fullWidthItem}>
                            <Text style={styles.label}>Valor</Text>
                            <Text style={styles.valueHighlight}>
                                {formatCurrency(expense.value)}
                            </Text>
                        </View>

                        {expense.description && (
                            <View style={styles.fullWidthItem}>
                                <Text style={styles.label}>Descrição</Text>
                                <Text style={styles.value}>{expense.description}</Text>
                            </View>
                        )}

                        {expense.paymentMethod && (
                            <View style={styles.fullWidthItem}>
                                <Text style={styles.label}>Método de Pagamento</Text>
                                <Text style={styles.value}>{expense.paymentMethod}</Text>
                            </View>
                        )}

                        <View style={styles.row}>
                            <View style={styles.infoItem}>
                                <Text style={styles.label}>Criado em</Text>
                                <Text style={styles.value}>
                                    {format(new Date(expense.createdAt), "dd/MM/yyyy HH:mm")}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.label}>Atualizado em</Text>
                                <Text style={styles.value}>
                                    {format(new Date(expense.updatedAt), "dd/MM/yyyy HH:mm")}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                            <Icon name="pencil" size={20} color={COLORS.white} />
                            <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Icon name="delete" size={20} color={COLORS.white} />
                            <Text style={styles.deleteButtonText}>Excluir</Text>
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
    },
    loadingText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: "#FF6B6B",
        marginTop: SIZES.padding,
        textAlign: "center",
    },
    goBackButton: {
        backgroundColor: "#FF6B6B",
        paddingHorizontal: SIZES.padding * 2,
        paddingVertical: SIZES.padding,
        borderRadius: SIZES.radius,
        marginTop: SIZES.padding,
    },
    goBackButtonText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.white,
    },
    header: {
        backgroundColor: COLORS.background,
        padding: SIZES.padding,
        paddingTop: SIZES.padding * 2,
        alignItems: "center",
    },
    headerTitle: {
        ...FONTS.bold,
        fontSize: SIZES.xlarge,
        color: COLORS.black,
        marginBottom: SIZES.base,
    },
    categoryBadge: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.base,
        borderRadius: SIZES.radius,
    },
    headerCategory: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: COLORS.white,
        margin: SIZES.padding,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: SIZES.padding,
    },
    infoItem: {
        flex: 1,
        marginHorizontal: SIZES.base / 2,
    },
    fullWidthItem: {
        marginBottom: SIZES.padding,
    },
    label: {
        ...FONTS.medium,
        fontSize: SIZES.small,
        color: COLORS.gray,
        marginBottom: SIZES.base / 2,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    value: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.text,
        lineHeight: 22,
    },
    valueHighlight: {
        ...FONTS.bold,
        fontSize: SIZES.large,
        color: "#FF6B6B",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        margin: SIZES.padding,
        gap: SIZES.padding,
    },
    editButton: {
        flex: 1,
        backgroundColor: "#4ECDC4",
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: SIZES.base,
    },
    editButtonText: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: COLORS.white,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: "#FF6B6B",
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: SIZES.base,
    },
    deleteButtonText: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: COLORS.white,
    },
});

export default ExpenseDetailsScreen;
