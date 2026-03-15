import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await register(name, email, password);
      router.replace("../tabs");
    } catch (error: any) {
      Alert.alert("Đăng ký thất bại", error.message || "Có lỗi xảy ra");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#4A148C", "#6A1B9A"]} style={styles.header}>
        <Text style={styles.logo}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>
          Đăng ký để bắt đầu sử dụng Vòng Sức Khỏe
        </Text>
      </LinearGradient>

      <View style={styles.container}>
        <Text style={styles.title}>Đăng ký</Text>

        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          placeholderTextColor="#90A4AE"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#90A4AE"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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

        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
          <Text style={styles.primaryButtonText}>Tạo tài khoản</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/login")}>
          <Text style={styles.linkText}>
            Đã có tài khoản? <Text style={styles.linkBold}>Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#4A148C",
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
    backgroundColor: "#6A1B9A",
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
    color: "#6A1B9A",
    fontWeight: "700",
  },
});
