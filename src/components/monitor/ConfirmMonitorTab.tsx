import { monitorHook } from "@/hooks/monitor";
import { styles } from "@/styles/appStyles";
import React, { useEffect, useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type ConfirmRequest = {
    id: string;
    requesterName: string;
    requesterPhone: string;
    requestedAt: string;
    status: string;
};

type Watcher = {
    id: string;
    name: string;
    phone: string;
    joinedAt: string;
};

type ConfirmMonitorTabProps = {
    userId: string;
};

export function ConfirmMonitorTab({ userId }: ConfirmMonitorTabProps) {
    const [confirmRequests, setConfirmRequests] = useState<ConfirmRequest[]>([]);
    const [watchers, setWatchers] = useState<Watcher[]>([]);
    const [loading, setLoading] = useState(false);
    const { getConfirmRequests, getUsersMonitoringMe, approveRequest, removeMonitorFromMe } = monitorHook();

    const loadConfirmData = async () => {
        if (loading) return;
        try {
            setLoading(true);
            const [requests, watcherList] = await Promise.all([
                getConfirmRequests(userId),
                getUsersMonitoringMe(userId),
            ]);
            setConfirmRequests(Array.isArray(requests) ? requests : []);
            setWatchers(Array.isArray(watcherList) ? watcherList : []);
        } catch (error) {
            console.log("Lỗi lấy dữ liệu xác nhận giám sát:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        Alert.alert(
            "Xác nhận",
            "Bạn có muốn đồng ý yêu cầu theo dõi này không?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await approveRequest(userId, requestId);
                            await loadConfirmData();
                        } catch (error) {
                            console.log("Lỗi duyệt yêu cầu:", error);
                            Alert.alert("Lỗi", (error as Error)?.message || "Không thể duyệt yêu cầu.");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
        );
    };

    const handleRemoveMonitorFromMe = async (relationId: string) => {
        Alert.alert(
            "Xác nhận",
            "Bạn có muốn hủy người này giám sát bạn không?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await removeMonitorFromMe(userId, relationId);
                            await loadConfirmData();
                        } catch (error) {
                            console.log("Lỗi hủy người giám sát:", error);
                            Alert.alert("Lỗi", (error as Error)?.message || "Không thể hủy người giám sát.");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
        );
    };

    useEffect(() => {
        loadConfirmData();
    }, [userId]);

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Yêu cầu xác nhận giám sát</Text>
            </View>

            {confirmRequests.length === 0 ? (
                <View style={localStyles.emptyState}>
                    <Text style={localStyles.emptyText}>Không có yêu cầu xác nhận.</Text>
                </View>
            ) : (
                confirmRequests.map((request) => (
                    <View key={request.id} style={localStyles.requestCard}>
                        <Text style={localStyles.personName}>{request.requesterName}</Text>
                        <Text style={localStyles.personMeta}>{request.requesterPhone}</Text>
                        <View style={localStyles.requestInfoRow}>
                            <Text style={localStyles.requestStatus}>{request.status}</Text>
                            <View style={localStyles.actionRow}>
                                <Text style={localStyles.requestDate}>{request.requestedAt}</Text>
                                <TouchableOpacity
                                    style={localStyles.approveButton}
                                    onPress={() => handleApproveRequest(request.id)}
                                >
                                    <Text style={localStyles.approveButtonText}>Đồng ý</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))
            )}

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Đang giám sát bạn</Text>
            </View>

            {watchers.length === 0 ? (
                <View style={localStyles.emptyState}>
                    <Text style={localStyles.emptyText}>Không có tài khoản đang giám sát bạn.</Text>
                </View>
            ) : (
                watchers.map((watcher) => (
                    <View key={watcher.id} style={localStyles.watcherCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={localStyles.personName}>{watcher.name}</Text>
                            <Text style={localStyles.personMeta}>{watcher.phone}</Text>
                            <Text style={localStyles.requestDate}>
                                Theo dõi từ {watcher.joinedAt}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={localStyles.cancelIconButton}
                            onPress={() => handleRemoveMonitorFromMe(watcher.id)}
                        >
                            <Text style={localStyles.cancelIconText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}
        </View>
    );
}

const localStyles = StyleSheet.create({
    requestCard: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginTop: 14,
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    personName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1B2A41",
    },
    personMeta: {
        marginTop: 4,
        fontSize: 13,
        color: "#607D8B",
    },
    requestInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },
    requestStatus: {
        color: "#EF6C00",
        fontWeight: "700",
    },
    requestDate: {
        color: "#607D8B",
        fontSize: 12,
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    approveButton: {
        backgroundColor: "#2E7D32",
        borderRadius: 14,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    approveButtonText: {
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
    cancelButton: {
        marginTop: 12,
        backgroundColor: "#D32F2F",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
    watcherCard: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginTop: 14,
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    cancelIconButton: {
        marginLeft: 12,
        backgroundColor: "#D32F2F",
        borderRadius: 14,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelIconText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
});
