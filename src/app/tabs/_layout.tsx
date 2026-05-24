import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function TabsLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1565C0",
        tabBarInactiveTintColor: "#90A4AE",
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 0,
          backgroundColor: "#fff",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === "index") {
            return <Ionicons name="home" size={size} color={color} />;
          }
          if (route.name === "heart-rate") {
            return (
              <FontAwesome5 name="heartbeat" size={size - 1} color={color} />
            );
          }
          if (route.name === "location") {
            return <Ionicons name="location" size={size} color={color} />;
          }
          if (route.name === "monitor") {
            return (
              <MaterialCommunityIcons
                name="account-eye"
                size={size}
                color={color}
              />
            );
          }
          return <Ionicons name="person" size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="test_connectdevice" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ title: "Trang chủ" }} />
      <Tabs.Screen name="heart-rate" options={{ title: "Nhịp tim" }} />
      <Tabs.Screen name="location" options={{ title: "Định vị" }} />
      <Tabs.Screen name="monitor" options={{ title: "Giám sát" }} />
      <Tabs.Screen name="profile" options={{ title: "Hồ sơ" }} />
    </Tabs>
  );
}
