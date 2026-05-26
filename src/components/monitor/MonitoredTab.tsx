import { monitorHook } from "@/hooks/monitor";
import { styles } from "@/styles/appStyles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type MonitorPerson = {
    id: string;
    name: string;
    age: string;
    relation: string;
    heartRate: string;
    status: string;
    isConnected: boolean;
    location: string;
};

type MonitoredTabProps = {
    userId: string;
};

export function MonitoredTab({ userId }: MonitoredTabProps) {
    const [monitoredList, setMonitoredList] = useState<MonitorPerson[]>([]);
    const [loading, setLoading] = useState(false);
    const { getListMonitors, stopMonitoring } = monitorHook();

    const loadMonitoredList = async () => {
        if (loading) return;
        try {
            setLoading(true);
            const data = await getListMonitors(userId);
            setMonitoredList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("Lỗi lấy danh sách đang giám sát:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStopMonitoring = async (personId: string) => {
        Alert.alert(
            "Xác nhận",
            "Bạn có muốn bỏ giám sát người này không?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await stopMonitoring(userId, personId);
                            loadMonitoredList();
                        } catch (error) {
                            console.log("Lỗi bỏ giám sát:", error);
                            Alert.alert("Lỗi", (error as Error)?.message || "Không thể bỏ giám sát.");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
        );
    };

    useEffect(() => {
        loadMonitoredList();
    }, [userId]);

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Người đang giám sát</Text>
            </View>

            {monitoredList.length === 0 ? (
                <View style={localStyles.emptyState}>
                    <Text style={localStyles.emptyText}>Không có người bạn đang giám sát.</Text>
                </View>
            ) : (
                monitoredList.map((person) => (
                    <View key={person.id} style={localStyles.personCard}>
                        <View style={localStyles.avatarWrap}>
                            <Ionicons name="person" size={28} color="#EF6C00" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={localStyles.personName}>{person.name}</Text>
                            <Text style={localStyles.personMeta}>
                                {person.relation} • {person.age} tuổi
                            </Text>
                            <View style={localStyles.inlineRow}>
                                <MaterialCommunityIcons name="heart-pulse" size={16} color="#E53935" />
                                <Text style={localStyles.inlineText}>{person.heartRate} BPM</Text>
                                <Ionicons
                                    name={person.isConnected ? "bluetooth" : "alert-circle"}
                                    size={16}
                                    color={person.isConnected ? "#2E7D32" : "#D32F2F"}
                                    style={{ marginLeft: 14 }}
                                />
                                <Text style={localStyles.inlineText}>
                                    {person.isConnected ? "Đã kết nối" : "Mất kết nối"}
                                </Text>
                            </View>
                            <Text style={localStyles.personLocation}>Vị trí: {person.location}</Text>
                        </View>
                        <View style={localStyles.actionsColumn}>
                            <TouchableOpacity
                                style={localStyles.stopButton}
                                onPress={() => handleStopMonitoring(person.id)}
                            >
                                <Text style={localStyles.stopButtonText}>Bỏ giám sát</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={localStyles.detailButton}
                                onPress={() => router.push(`../tabs/monitor/${person.id}`)}
                            >
                                <Text style={localStyles.detailButtonText}>Chi tiết</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </View>
    );
}

const localStyles = StyleSheet.create({
    personCard: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginTop: 14,
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    avatarWrap: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: "#FFF3E0",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    personName: {
        fontSize: 17,
        fontWeight: "800",
        color: "#1B2A41",
    },
    personMeta: {
        marginTop: 4,
        fontSize: 13,
        color: "#607D8B",
    },
    inlineRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    inlineText: {
        marginLeft: 6,
        fontSize: 13,
        color: "#455A64",
        fontWeight: "600",
    },
    personLocation: {
        marginTop: 8,
        fontSize: 13,
        color: "#607D8B",
    },
    actionsColumn: {
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    stopButton: {
        backgroundColor: "#D32F2F",
        borderRadius: 14,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 8,
    },
    stopButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
    detailButton: {
        backgroundColor: "#EF6C00",
        borderRadius: 14,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    detailButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
    emptyState: {
        marginHorizontal: 16,
        marginTop: 20,
        padding: 18,
        borderRadius: 18,
        backgroundColor: "#FFF8E1",
    },
    emptyText: {
        color: "#795548",
        fontSize: 14,
    },
});