import { monitorHook } from "@/hooks/monitor";
import { styles } from "@/styles/appStyles";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type AddMonitorTabProps = {
    userId: string;
};

export function AddMonitorTab({ userId }: AddMonitorTabProps) {
    const [invitePhone, setInvitePhone] = useState("");
    const [loading, setLoading] = useState(false);
    const { addMonitorByPhone } = monitorHook();

    const handleInviteByPhone = async () => {
        if (!invitePhone.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập số điện thoại cần giám sát.");
            return;
        }

        try {
            setLoading(true);
            await addMonitorByPhone(userId, invitePhone.trim());
            Alert.alert("Thành công", "Đã gửi yêu cầu giám sát theo số điện thoại.");
            setInvitePhone("");
        } catch (error) {
            console.log("Lỗi thêm giám sát:", error);
            Alert.alert("Lỗi", (error as Error)?.message || "Không thể thêm giám sát.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Thêm giám sát người khác</Text>
            </View>

            <View style={localStyles.addCard}>
                <Text style={localStyles.label}>Số điện thoại người cần giám sát</Text>
                <TextInput
                    style={localStyles.input}
                    keyboardType="phone-pad"
                    placeholder="Nhập số điện thoại"
                    placeholderTextColor="#9E9E9E"
                    value={invitePhone}
                    onChangeText={setInvitePhone}
                />
                <TouchableOpacity
                    style={localStyles.inviteButton}
                    onPress={handleInviteByPhone}
                    disabled={loading}
                >
                    <Text style={localStyles.inviteButtonText}>Gửi yêu cầu</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const localStyles = StyleSheet.create({
    addCard: {
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
    label: {
        fontSize: 14,
        marginBottom: 8,
        color: "#455A64",
    },
    input: {
        backgroundColor: "#F5F5F5",
        borderRadius: 14,
        padding: 12,
        marginBottom: 14,
        fontSize: 15,
        color: "#1E272E",
    },
    inviteButton: {
        backgroundColor: "#EF6C00",
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
    },
    inviteButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
});
