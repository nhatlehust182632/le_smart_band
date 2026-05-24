import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/appStyles";

type MainActionsSectionProps = {
  onConnectPress: () => void;
};

export function MainActionsSection({ onConnectPress }: MainActionsSectionProps) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chức năng chính</Text>
      </View>

      <View style={localStyles.quickGrid}>
        <TouchableOpacity style={localStyles.quickCard} onPress={onConnectPress}>
          <View style={[styles.quickIcon, { backgroundColor: "#E3F2FD" }]}>
            <MaterialCommunityIcons
              name="bluetooth-connect"
              size={24}
              color="#1565C0"
            />
          </View>
          <Text style={styles.quickTitle}>Kết nối</Text>
          <Text style={styles.quickDesc}>Tìm và kết nối vòng tay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={localStyles.quickCard}
          onPress={() => router.push("../tabs/heart-rate")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#FCE4EC" }]}>
            <FontAwesome5 name="heartbeat" size={22} color="#E53935" />
          </View>
          <Text style={styles.quickTitle}>Nhịp tim</Text>
          <Text style={styles.quickDesc}>Theo dõi bất thường</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={localStyles.quickCard}
          onPress={() => router.push("../tabs/location")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons name="location" size={24} color="#2E7D32" />
          </View>
          <Text style={styles.quickTitle}>Định vị</Text>
          <Text style={styles.quickDesc}>Xem vị trí cuối cùng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={localStyles.quickCard}
          onPress={() => router.push("../tabs/monitor")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#FFF3E0" }]}>
            <MaterialCommunityIcons
              name="account-eye"
              size={24}
              color="#EF6C00"
            />
          </View>
          <Text style={styles.quickTitle}>Giám sát</Text>
          <Text style={styles.quickDesc}>Theo dõi người thân</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const localStyles = StyleSheet.create({
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
});
