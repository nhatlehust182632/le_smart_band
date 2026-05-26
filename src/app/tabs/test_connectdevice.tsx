import { useAuth } from "@/context/AuthContext";
import {
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    FlatList,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBleConnectDevice } from "../../components/ble_packet_refactor/hook/useBleConnectDevice";
import { styles } from "../../styles/appStyles";

export default function TestConnectDeviceScreen() {
    const { user } = useAuth();
    const {
        scanModalVisible,
        setScanModalVisible,
        devices,
        scanning,
        status,
        connectedDevice,
        startScan,
        connectDevice,
        disconnect,
    } = useBleConnectDevice(user?.device_id, user?.id);

    return (
        <SafeAreaView style={localStyles.safeBlue}>
            <StatusBar barStyle="light-content" />

            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <LinearGradient
                        colors={["#0D47A1", "#1976D2"]}
                        style={styles.header}
                    >
                        <View style={styles.headerTop}>
                            <View>
                                <Text style={styles.greeting}>
                                    Xin chào, {user?.full_name}
                                </Text>

                                <Text style={styles.subGreeting}>
                                    Theo dõi sức khỏe mỗi ngày
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>

                    <View style={styles.card}>
                        <View style={styles.cardTitleRow}>
                            <MaterialCommunityIcons
                                name="watch-variant"
                                size={22}
                                color="#1565C0"
                            />

                            <Text style={styles.cardTitle}>
                                Vòng tay sức khỏe
                            </Text>
                        </View>

                        <View style={styles.deviceRow}>
                            <View style={styles.deviceBadge}>
                                <MaterialCommunityIcons
                                    name="bluetooth-connect"
                                    size={26}
                                    color="#1565C0"
                                />
                            </View>

                            <View style={{ flex: 1 }}>
                                {connectedDevice && (
                                    <Text style={styles.deviceName}>
                                        {connectedDevice.name ||
                                            connectedDevice.id}
                                    </Text>
                                )}

                                <Text style={styles.deviceStatus}>
                                    {status}
                                </Text>
                            </View>

                            {connectedDevice ? (
                                <TouchableOpacity
                                    style={styles.primaryBtnNKT}
                                    onPress={disconnect}
                                >
                                    <Text style={styles.primaryBtnText}>
                                        Ngắt kết nối
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.primaryBtn}
                                    onPress={startScan}
                                >
                                    <Text style={styles.primaryBtnText}>
                                        {scanning
                                            ? "Đang quét..."
                                            : "Quét thiết bị"}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </ScrollView>

                <Modal
                    visible={scanModalVisible}
                    animationType="slide"
                    transparent
                    onRequestClose={() => {
                        setScanModalVisible(false);
                    }}
                >
                    <View style={localStyles.modalOverlay}>
                        <View style={localStyles.modalContent}>
                            <View style={localStyles.modalHeader}>
                                <Text style={localStyles.modalTitle}>
                                    Thiết bị BLE tìm thấy
                                </Text>

                                <TouchableOpacity
                                    onPress={() => {
                                        setScanModalVisible(false);
                                    }}
                                >
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color="#333"
                                    />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={devices.filter((device) => device.name)}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={localStyles.deviceItemBLE}
                                        onPress={() => connectDevice(item, user?.id)}
                                    >
                                        <Text style={localStyles.deviceItemName}>
                                            {item.name || "Unknown Device"}
                                        </Text>

                                        <Text style={localStyles.deviceId}>
                                            {item.id}
                                        </Text>

                                        <Text style={localStyles.deviceId}>
                                            RSSI: {item.rssi ?? "-"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />

                            <TouchableOpacity
                                style={localStyles.scanAgainBtn}
                                onPress={startScan}
                                disabled={scanning}
                            >
                                <Text style={localStyles.scanAgainBtnText}>
                                    {scanning
                                        ? "Đang quét..."
                                        : "Quét lại"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    safeBlue: {
        flex: 1,
        backgroundColor: "#0D47A1",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 16,
        maxHeight: "75%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0D1B2A",
    },
    scanAgainBtn: {
        backgroundColor: "#1565C0",
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 8,
    },
    scanAgainBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
    deviceItemBLE: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    deviceItemName: {
        fontSize: 16,
        fontWeight: "600",
    },
    deviceId: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
});
