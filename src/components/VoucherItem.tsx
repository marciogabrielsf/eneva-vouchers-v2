import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Voucher } from "../types";
import { COLORS, FONTS, SIZES } from "../theme";

interface VoucherItemProps {
    voucher: Voucher;
    onPress: (voucher: Voucher) => void;
}

const VoucherItem: React.FC<VoucherItemProps> = ({ voucher, onPress }) => {
    const formatValue = (value: number) => {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const categoryName = (code: string) => {
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
    };

    const formattedDate = new Date(voucher.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "utc",
    });

    return (
        <TouchableOpacity style={styles.container} onPress={() => onPress(voucher)}>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Voucher</Text>
                <Text style={styles.value}>
                    {voucher.taxNumber} - {voucher.requestCode}
                </Text>
            </View>

            <View style={styles.bottomRow}>
                <Text style={styles.date}>{formattedDate}</Text>
                <Text style={styles.price}>{formatValue(voucher.value)}</Text>
            </View>
        </TouchableOpacity>
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
    infoContainer: {
        marginBottom: SIZES.base,
    },
    label: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.gray,
    },
    value: {
        ...FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.black,
        marginTop: 2,
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: SIZES.base,
    },
    date: {
        ...FONTS.regular,
        fontSize: SIZES.small,
        color: COLORS.gray,
    },
    price: {
        ...FONTS.bold,
        fontSize: SIZES.medium,
        color: COLORS.green,
    },
});

export default VoucherItem;
