import {
    FontAwesome5,
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function App() {
    const heartRate = 152;
    const isAbnormal = heartRate > 120;

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.header}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity style={styles.iconBtn}>
                                <Ionicons name="menu" size={24} color="#fff" />
                            </TouchableOpacity>

                            <View>
                                <Text style={styles.greeting}>Xin chào, Nam</Text>
                                <Text style={styles.subGreeting}>
                                    Theo dõi sức khỏe mỗi ngày
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.iconBtn}>
                                <Ionicons name="notifications-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    {/* Device Card */}
                    <View style={styles.card}>
                        <View style={styles.cardTitleRow}>
                            <MaterialCommunityIcons
                                name="watch-variant"
                                size={22}
                                color="#1565C0"
                            />
                            <Text style={styles.cardTitle}>Vòng tay sức khỏe</Text>
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
                                <Text style={styles.deviceName}>VSK Smart Band A1</Text>
                                <Text style={styles.deviceStatus}>Đã kết nối</Text>
                            </View>

                            <TouchableOpacity style={styles.primaryBtn}>
                                <Text style={styles.primaryBtnText}>Quét lại</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Heart Rate Overview */}
                    <LinearGradient
                        colors={["#E53935", "#FF6B6B"]}
                        style={styles.heartCard}
                    >
                        <View style={styles.heartTop}>
                            <View>
                                <Text style={styles.heartLabel}>Nhịp tim hiện tại</Text>
                                <Text style={styles.heartValue}>{heartRate} BPM</Text>
                            </View>

                            <View style={styles.heartIconWrap}>
                                <FontAwesome5 name="heartbeat" size={30} color="#fff" />
                            </View>
                        </View>

                        <Text style={styles.heartDesc}>
                            {isAbnormal
                                ? "Phát hiện nhịp tim bất thường, cần theo dõi."
                                : "Nhịp tim đang ở mức ổn định."}
                        </Text>
                    </LinearGradient>

                    {/* Alert */}
                    {isAbnormal && (
                        <View style={styles.alertCard}>
                            <View style={styles.alertLeft}>
                                <Ionicons name="warning" size={24} color="#D32F2F" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.alertTitle}>Cảnh báo dung nhĩ</Text>
                                <Text style={styles.alertText}>
                                    Hệ thống AI phát hiện dấu hiệu nhịp tim bất thường. Hãy nghỉ
                                    ngơi và liên hệ người thân hoặc bác sĩ nếu cần.
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Quick Actions */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Chức năng chính</Text>
                    </View>

                    <View style={styles.quickGrid}>
                        <TouchableOpacity style={styles.quickCard}>
                            <View style={[styles.quickIcon, { backgroundColor: "#E3F2FD" }]}>
                                <MaterialCommunityIcons
                                    name="bluetooth-searching"
                                    size={24}
                                    color="#1565C0"
                                />
                            </View>
                            <Text style={styles.quickTitle}>Quét thiết bị</Text>
                            <Text style={styles.quickDesc}>Tìm và kết nối vòng tay</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickCard}>
                            <View style={[styles.quickIcon, { backgroundColor: "#FCE4EC" }]}>
                                <FontAwesome5 name="heartbeat" size={22} color="#E53935" />
                            </View>
                            <Text style={styles.quickTitle}>Nhịp tim</Text>
                            <Text style={styles.quickDesc}>Theo dõi bất thường</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickCard}>
                            <View style={[styles.quickIcon, { backgroundColor: "#E8F5E9" }]}>
                                <Ionicons name="location" size={24} color="#2E7D32" />
                            </View>
                            <Text style={styles.quickTitle}>Định vị</Text>
                            <Text style={styles.quickDesc}>Xem vị trí cuối cùng</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Last Location */}
                    <View style={styles.card}>
                        <View style={styles.cardTitleRow}>
                            <Ionicons name="location" size={22} color="#2E7D32" />
                            <Text style={styles.cardTitle}>Vị trí cuối cùng</Text>
                        </View>

                        <View style={styles.mapPlaceholder}>
                            <Ionicons name="map" size={42} color="#90A4AE" />
                            <Text style={styles.mapText}>Công viên Thống Nhất</Text>
                            <Text style={styles.mapSubText}>Cập nhật 5 phút trước</Text>
                        </View>
                    </View>

                    {/* Health Summary */}
                    <View style={styles.card}>
                        <View style={styles.cardTitleRow}>
                            <Ionicons name="stats-chart" size={22} color="#1565C0" />
                            <Text style={styles.cardTitle}>Tổng quan hôm nay</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <View style={styles.summaryBox}>
                                <Text style={styles.summaryNumber}>8,245</Text>
                                <Text style={styles.summaryLabel}>Bước chân</Text>
                            </View>

                            <View style={styles.summaryBox}>
                                <Text style={styles.summaryNumber}>72</Text>
                                <Text style={styles.summaryLabel}>Nhịp tim TB</Text>
                            </View>

                            <View style={styles.summaryBox}>
                                <Text style={styles.summaryNumber}>7h20</Text>
                                <Text style={styles.summaryLabel}>Giấc ngủ</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Bottom Tab */}
                <View style={styles.bottomTab}>
                    <TouchableOpacity style={styles.tabItem}>
                        <Ionicons name="home" size={22} color="#1565C0" />
                        <Text style={[styles.tabLabel, styles.tabActive]}>Trang chủ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem}>
                        <FontAwesome5 name="heartbeat" size={20} color="#90A4AE" />
                        <Text style={styles.tabLabel}>Nhịp tim</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem}>
                        <Ionicons name="location" size={22} color="#90A4AE" />
                        <Text style={styles.tabLabel}>Định vị</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem}>
                        <Ionicons name="person" size={22} color="#90A4AE" />
                        <Text style={styles.tabLabel}>Hồ sơ</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#0D47A1",
    },
    container: {
        flex: 1,
        backgroundColor: "#F4F7FB",
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    greeting: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
    },
    subGreeting: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 13,
        textAlign: "center",
        marginTop: 4,
    },
    card: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    cardTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
        gap: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1B2A41",
    },
    deviceRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    deviceBadge: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: "#E3F2FD",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1B2A41",
    },
    deviceStatus: {
        marginTop: 4,
        color: "#2E7D32",
        fontWeight: "600",
    },
    primaryBtn: {
        backgroundColor: "#1565C0",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    primaryBtnText: {
        color: "#fff",
        fontWeight: "700",
    },
    heartCard: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 24,
        padding: 18,
    },
    heartTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    heartLabel: {
        color: "#fff",
        fontSize: 14,
        opacity: 0.95,
    },
    heartValue: {
        color: "#fff",
        fontSize: 34,
        fontWeight: "800",
        marginTop: 6,
    },
    heartIconWrap: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    heartDesc: {
        color: "#fff",
        fontSize: 14,
        marginTop: 14,
        lineHeight: 20,
    },
    alertCard: {
        backgroundColor: "#FFF3F3",
        borderWidth: 1,
        borderColor: "#FFCDD2",
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 18,
        padding: 14,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    alertLeft: {
        marginRight: 10,
        marginTop: 2,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#C62828",
        marginBottom: 6,
    },
    alertText: {
        color: "#6D4C41",
        lineHeight: 20,
    },
    sectionHeader: {
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1B2A41",
    },
    quickGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 16,
        gap: 10,
    },
    quickCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 14,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    quickIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    quickTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1B2A41",
        textAlign: "center",
    },
    quickDesc: {
        fontSize: 12,
        color: "#607D8B",
        textAlign: "center",
        marginTop: 6,
        lineHeight: 17,
    },
    mapPlaceholder: {
        height: 170,
        borderRadius: 18,
        backgroundColor: "#EEF4F8",
        alignItems: "center",
        justifyContent: "center",
    },
    mapText: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: "700",
        color: "#1B2A41",
    },
    mapSubText: {
        marginTop: 6,
        fontSize: 13,
        color: "#607D8B",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    summaryBox: {
        flex: 1,
        backgroundColor: "#F7FAFD",
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: "center",
    },
    summaryNumber: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1565C0",
    },
    summaryLabel: {
        marginTop: 6,
        fontSize: 13,
        color: "#607D8B",
    },
    bottomTab: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 16,
        height: 70,
        backgroundColor: "#fff",
        borderRadius: 22,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    tabItem: {
        alignItems: "center",
        justifyContent: "center",
    },
    tabLabel: {
        fontSize: 12,
        color: "#90A4AE",
        marginTop: 4,
        fontWeight: "600",
    },
    tabActive: {
        color: "#1565C0",
    },
});
