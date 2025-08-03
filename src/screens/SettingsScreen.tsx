import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    TextInput,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, FONTS, SIZES } from "../theme";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { FocusAwareStatusBar } from "../components/focusAwareStatusBar";

const SettingsScreen = () => {
    const { user, logout } = useAuth();
    const { discountPercentage, setDiscountPercentage, monthStartDay, setMonthStartDay } =
        useSettings();
    const [discountModalVisible, setDiscountModalVisible] = useState(false);
    const [monthDayModalVisible, setMonthDayModalVisible] = useState(false);
    const [discountInputValue, setDiscountInputValue] = useState(discountPercentage.toString());
    const [monthDayInputValue, setMonthDayInputValue] = useState(monthStartDay.toString());

    const handleLogout = useCallback(() => {
        Alert.alert("Sair", "Tem certeza que deseja sair?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Sair", style: "destructive", onPress: () => logout() },
        ]);
    }, [logout]);

    const handleSaveDiscount = useCallback(async () => {
        const value = parseFloat(discountInputValue);
        if (isNaN(value) || value < 0 || value > 1) {
            Alert.alert("Valor Inválido", "Por favor, insira um valor entre 0 e 1");
            return;
        }

        await setDiscountPercentage(value);
        setDiscountModalVisible(false);
    }, [discountInputValue, setDiscountPercentage]);

    const handleSaveMonthStartDay = useCallback(async () => {
        const day = parseInt(monthDayInputValue);
        if (isNaN(day) || day < 1 || day > 31) {
            Alert.alert("Valor Inválido", "Por favor, insira um valor entre 1 e 31");
            return;
        }

        await setMonthStartDay(day);
        setMonthDayModalVisible(false);
    }, [monthDayInputValue, setMonthStartDay]);

    const userFirstAndSecondName = user?.name.split(" ").slice(0, 2).join(" ") || "Usuário";

    return (
        <>
            <FocusAwareStatusBar backgroundColor={COLORS.background} animated style="dark" />
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Configurações</Text>
                    </View>

                    <View style={styles.userSection}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {user?.firstName?.charAt(0) || "U"}
                            </Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>
                                {userFirstAndSecondName || "Usuário"}
                            </Text>
                            {/* <Text style={styles.userEmail}>{user?.email || "email@exemplo.com"}</Text> */}
                        </View>
                    </View>
                    {/* 
                <View style={styles.settingsGroup}>
                    <Text style={styles.groupTitle}>Conta</Text>

                    <TouchableOpacity style={styles.settingItem}>
                        <Icon name="account-edit" size={24} color={COLORS.black} />
                        <Text style={styles.settingText}>Editar Perfil</Text>
                        <Icon name="chevron-right" size={24} color={COLORS.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <Icon name="lock" size={24} color={COLORS.black} />
                        <Text style={styles.settingText}>Alterar Senha</Text>
                        <Icon name="chevron-right" size={24} color={COLORS.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <Icon name="bell" size={24} color={COLORS.black} />
                        <Text style={styles.settingText}>Notificações</Text>
                        <Icon name="chevron-right" size={24} color={COLORS.gray} />
                    </TouchableOpacity>
                </View> */}

                    <View style={styles.settingsGroup}>
                        <Text style={styles.groupTitle}>Aplicativo</Text>

                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={() => {
                                setDiscountInputValue(discountPercentage.toString());
                                setDiscountModalVisible(true);
                            }}
                        >
                            <Icon name="percent" size={24} color={COLORS.black} />
                            <Text style={styles.settingText}>Percentual de Desconto</Text>
                            <Text style={styles.settingValue}>
                                {(discountPercentage * 100).toFixed(0)}%
                            </Text>
                            <Icon name="chevron-right" size={24} color={COLORS.gray} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={() => {
                                setMonthDayInputValue(monthStartDay.toString());
                                setMonthDayModalVisible(true);
                            }}
                        >
                            <Icon name="calendar-month" size={24} color={COLORS.black} />
                            <Text style={styles.settingText}>Dia de Início do Mês</Text>
                            <Text style={styles.settingValue}>{monthStartDay}</Text>
                            <Icon name="chevron-right" size={24} color={COLORS.gray} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                            <Icon name="logout" size={24} color={COLORS.red} />
                            <Text style={[styles.settingText, { color: COLORS.red }]}>Sair</Text>
                            <Icon name="chevron-right" size={24} color={COLORS.gray} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Discount Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={discountModalVisible}
                    onRequestClose={() => setDiscountModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Percentual de Desconto</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={discountInputValue}
                                    onChangeText={setDiscountInputValue}
                                    keyboardType="decimal-pad"
                                    placeholder="0.15 (15%)"
                                />
                                <Text style={styles.inputHelp}>
                                    Digite um valor entre 0 e 1 (ex: 0.15 para 15%)
                                </Text>
                            </View>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setDiscountModalVisible(false)}
                                >
                                    <Text style={[styles.buttonText, { color: COLORS.black }]}>
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleSaveDiscount}
                                >
                                    <Text style={styles.buttonText}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Month Day Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={monthDayModalVisible}
                    onRequestClose={() => setMonthDayModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Dia de Início do Mês</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={monthDayInputValue}
                                    onChangeText={setMonthDayInputValue}
                                    keyboardType="number-pad"
                                    placeholder="1-31"
                                />
                                <Text style={styles.inputHelp}>
                                    Digite um dia entre 1 e 31 para definir como início do mês
                                </Text>
                            </View>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setMonthDayModalVisible(false)}
                                >
                                    <Text style={[styles.buttonText, { color: COLORS.black }]}>
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleSaveMonthStartDay}
                                >
                                    <Text style={styles.buttonText}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SIZES.padding,
    },
    headerTitle: {
        ...FONTS.bold,
        fontSize: SIZES.xxlarge,
        color: COLORS.black,
    },
    userSection: {
        flexDirection: "row",
        alignItems: "center",
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        marginBottom: SIZES.padding,
        borderRadius: SIZES.radius,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.black,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        ...FONTS.bold,
        fontSize: SIZES.xlarge,
        color: COLORS.white,
    },
    userInfo: {
        marginLeft: SIZES.padding,
    },
    userName: {
        ...FONTS.bold,
        fontSize: SIZES.large,
        color: COLORS.black,
    },
    userEmail: {
        ...FONTS.regular,
        fontSize: SIZES.medium,
        color: COLORS.gray,
    },
    settingsGroup: {
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        marginBottom: SIZES.padding,
        borderRadius: SIZES.radius,
        overflow: "hidden",
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    groupTitle: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.gray,
        padding: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    settingText: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.black,
        flex: 1,
        marginLeft: SIZES.padding,
    },
    settingValue: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.black,
        marginRight: SIZES.base,
    },
    logoutButton: {
        backgroundColor: COLORS.red,
        margin: SIZES.padding,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SIZES.padding * 3,
    },
    logoutText: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: COLORS.white,
        marginLeft: SIZES.base,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding * 1.5,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        ...FONTS.bold,
        fontSize: SIZES.large,
        color: COLORS.black,
        marginBottom: SIZES.padding,
        textAlign: "center",
    },
    inputContainer: {
        marginBottom: SIZES.padding,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: SIZES.radius / 2,
        padding: SIZES.padding,
        ...FONTS.regular,
        fontSize: SIZES.medium,
    },
    inputHelp: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.gray,
        marginTop: SIZES.base,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalButton: {
        flex: 1,
        padding: SIZES.padding,
        borderRadius: SIZES.radius / 2,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: COLORS.lightGray,
        marginRight: SIZES.base,
    },
    saveButton: {
        backgroundColor: COLORS.green,
        marginLeft: SIZES.base,
    },
    buttonText: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: COLORS.white,
    },
});

export default SettingsScreen;
