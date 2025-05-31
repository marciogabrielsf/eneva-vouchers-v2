import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, SIZES } from "../theme";

interface AddButtonProps {
    onPress: () => void;
    disabled?: boolean;
}

const AddButton: React.FC<AddButtonProps> = ({ onPress, disabled = false }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, disabled && styles.disabledButton]}
                onPress={onPress}
                disabled={disabled}
            >
                <Icon name="plus" size={30} color={COLORS.white} /> 
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 20,
        right: 20,
        alignItems: "center",
        zIndex: 999,
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: 30,
        backgroundColor: COLORS.green,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: COLORS.gray,
        opacity: 0.7,
    },
});

export default AddButton;
