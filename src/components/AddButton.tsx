import React from "react";
import { TouchableOpacity, StyleSheet, View, Animated } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS, SIZES } from "../theme";
import { LinearGradient } from "expo-linear-gradient";

interface AddButtonProps {
    onPress: () => void;
    disabled?: boolean;
}

const AddButton: React.FC<AddButtonProps> = ({ onPress, disabled = false }) => {
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleValue }] }]}>
                <TouchableOpacity
                    style={[styles.button, disabled && styles.disabledButton]}
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={disabled}
                    activeOpacity={0.8}
                >                                

                    <LinearGradient
                        colors={disabled ? ["#8f92a1", "#8f92a1"] : ["#112599", "#3841ef"]}
                        style={styles.gradient}
                    >
                        <Icon name="plus" size={28} color={COLORS.white} />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 24,
        right: 24,
        alignItems: "center",
        zIndex: 999,
    },
    buttonContainer: {
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    button: {
        width: 35,
        height: 35,
        borderRadius: 30,
        overflow: "hidden",
    },
    gradient: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 30,
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default AddButton;
