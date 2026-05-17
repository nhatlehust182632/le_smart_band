import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type LoadingScreenProps = {
    message?: string;
};

export default function LoadingScreen({
    message = "Đang tải dữ liệu...",
}: LoadingScreenProps) {
    return (
        <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.container}>
            <View style={styles.card}>
                <ActivityIndicator size="large" color="#1565C0" />
                <Text style={styles.title}>Vòng Sức Khỏe</Text>
                <Text style={styles.message}>{message}</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    card: {
        width: "100%",
        maxWidth: 320,
        backgroundColor: "#fff",
        borderRadius: 24,
        paddingVertical: 32,
        paddingHorizontal: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    title: {
        marginTop: 18,
        fontSize: 22,
        fontWeight: "800",
        color: "#1B2A41",
    },
    message: {
        marginTop: 10,
        fontSize: 14,
        color: "#607D8B",
        textAlign: "center",
        lineHeight: 20,
    },
});
