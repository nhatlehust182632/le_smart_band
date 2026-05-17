import LoadingScreen from "@/components/LoadingScreen";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("378147307");
  const [password, setPassword] = useState("123456");

  const handleLogin = async () => {
    if (loading) return; //  🔥 CHẶN SPAM TẠI ĐÂY
    try {
      setLoading(true);
      await login(phone, password);
      router.replace("/tabs");
    } catch (error: any) {
      Alert.alert("Đăng nhập thất bại", error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tải danh sách giám sát..." />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.header}>
        <Text style={styles.logo}>Vòng Sức Khỏe</Text>
        <Text style={styles.subtitle}>
          Đăng nhập để theo dõi sức khỏe của bạn
        </Text>
      </LinearGradient>

      <View style={styles.container}>
        <Text style={styles.title}>Đăng nhập</Text>

        <TextInput
          style={styles.input}
          placeholder="Điện thoại"
          placeholderTextColor="#90A4AE"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#90A4AE"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text style={styles.linkText}>
            Chưa có tài khoản? <Text style={styles.linkBold}>Đăng ký</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0D47A1",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 36,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logo: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1B2A41",
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    height: 54,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 15,
    color: "#1B2A41",
  },
  primaryButton: {
    height: 54,
    backgroundColor: "#1565C0",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 18,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  linkText: {
    textAlign: "center",
    color: "#607D8B",
    fontSize: 14,
  },
  linkBold: {
    color: "#1565C0",
    fontWeight: "700",
  },
});
