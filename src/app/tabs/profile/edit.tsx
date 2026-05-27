import { User } from "@/api/models/user.model";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileContext } from "./profile-context";
import { styles } from "../../../styles/appStyles";

export default function EditProfileScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergency_contact_name, setEmergency_contact_name] = useState("");
  const [emergency_contact_phone, setEmergency_contact_phone] = useState("");
  const [age, setAge] = useState("");
  const [height_cm, setHeight_cm] = useState("");
  const [weight_kg, setWeight_kg] = useState("");
  const [gender, setGender] = useState("male");
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { profileDetail, refreshProfileData, saveProfileDetail } = useProfileContext();

  const handleGetInfo = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await refreshProfileData();
      const data = profileDetail;
      if (!data) return;
      setFullName(data?.full_name);
      setPhone(data?.phone);
      setEmergency_contact_name(data?.emergency_contact_name);
      setEmergency_contact_phone(data?.emergency_contact_phone);
      setAge(data?.age + "" || "");
      setHeight_cm(data?.height_cm + "" || "");
      setWeight_kg(data?.weight_kg + "" || "");
      setGender(data?.gender);
      console.log("UserEdit: ", data);
    } catch (error: any) {
      Alert.alert("Đăng nhập thất bại", error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (loading) return;

    if (!fullName) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ thông tin Họ và tên.",
      );
      return;
    }

    try {
      setLoading(true);
      const paramData: User = {
        id: user?.id || "",
        email: "",
        phone: "",
        password_hash: "",
        full_name: fullName,
        gender: gender,
        date_of_birth: null,
        height_cm: Number(height_cm),
        weight_kg: Number(weight_kg),
        timezone: "",
        language: "",
        status: "active",
        created_at: "",
        updated_at: null,
        age: Number(age),
        emergency_contact_name: emergency_contact_name,
        emergency_contact_phone: emergency_contact_phone,
      };
      const data = await saveProfileDetail(paramData);
      console.log("Profile: ", data);
      Alert.alert("Thành công", "Cập nhật thông tin thành công.");
      router.back();
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể cập nhật thông tin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileDetail) {
      setFullName(profileDetail?.full_name ?? "");
      setPhone(profileDetail?.phone ?? "");
      setEmergency_contact_name(profileDetail?.emergency_contact_name ?? "");
      setEmergency_contact_phone(profileDetail?.emergency_contact_phone ?? "");
      setAge(profileDetail?.age + "" || "");
      setHeight_cm(profileDetail?.height_cm + "" || "");
      setWeight_kg(profileDetail?.weight_kg + "" || "");
      setGender(profileDetail?.gender ?? "male");
      return;
    }
    void handleGetInfo();
  }, [profileDetail]);

  return (
    <SafeAreaView style={localStyles.safePurple}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <LinearGradient colors={["#4A148C", "#6A1B9A"]} style={styles.header}>
          <View style={localStyles.headerRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Cập nhật hồ sơ</Text>
              <Text style={styles.subGreeting}>
                Chỉnh sửa thông tin người dùng
              </Text>
            </View>

            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={localStyles.formCard}>
            <Text style={localStyles.label}>Họ và tên</Text>
            <TextInput
              style={localStyles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#90A4AE"
            />

            <Text style={localStyles.label}>Số điện thoại</Text>
            <TextInput
              style={localStyles.input}
              value={phone}
              editable={false}
              onFocus={() => {
                Alert.alert("Thông báo", "Không thể thay đổi số điện thoại");
              }}
              onChangeText={setPhone}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#90A4AE"
              keyboardType="phone-pad"
            />

            <Text style={localStyles.label}>Tuổi</Text>
            <TextInput
              style={localStyles.input}
              value={age}
              // onChangeText={setAge}
              placeholder="Nhập tuổi"
              placeholderTextColor="#90A4AE"
              keyboardType="number-pad"
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, "");
                setAge(cleaned);
              }}
            />

            <Text style={localStyles.label}>Giới tính</Text>
            <TouchableOpacity
              style={localStyles.selectBox}
              onPress={() => setGenderModalVisible(true)}
            >
              <Text
                style={[
                  localStyles.selectBoxText,
                  !gender && localStyles.placeholderText,
                ]}
              >
                {gender == "male" ? "Nam" : gender == "female" ? "Nữ" : "Khác"}
              </Text>

              <Ionicons name="chevron-down" size={20} color="#607D8B" />
            </TouchableOpacity>

            <Text style={localStyles.label}>Chiều cao</Text>
            <TextInput
              style={localStyles.input}
              value={height_cm}
              // onChangeText={setHeight_cm}
              placeholder="Nhập chiều cao"
              placeholderTextColor="#90A4AE"
              keyboardType="number-pad"
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, "");
                setHeight_cm(cleaned);
              }}
            />

            <Text style={localStyles.label}>Cân nặng</Text>
            <TextInput
              style={localStyles.input}
              value={weight_kg}
              // onChangeText={setWeight_kg}
              placeholder="Nhập cân nặng"
              placeholderTextColor="#90A4AE"
              keyboardType="number-pad"
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, "");
                setWeight_kg(cleaned);
              }}
            />

            <Text style={localStyles.label}>Người liên hệ khẩn cấp</Text>
            <TextInput
              style={localStyles.input}
              value={emergency_contact_name}
              onChangeText={setEmergency_contact_name}
              placeholder="Nhập người liên hệ khẩn cấp"
              placeholderTextColor="#90A4AE"
            />

            <Text style={localStyles.label}>
              Số điện thoại liên hệ khẩn cấp liên hệ khẩn cấp
            </Text>
            <TextInput
              style={localStyles.input}
              value={emergency_contact_phone}
              onChangeText={setEmergency_contact_phone}
              placeholder="Nhập số điện thoại người liên hệ khẩn cấp"
              placeholderTextColor="#90A4AE"
            />

            <TouchableOpacity
              style={[localStyles.saveButton, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={localStyles.saveButtonText}>
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={localStyles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={localStyles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
      <Modal
        visible={genderModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setGenderModalVisible(false)}>
          <View style={localStyles.modalOverlay}>
            {/* 🔥 Ngăn không cho tap vào content bị đóng */}
            <TouchableWithoutFeedback>
              <View style={localStyles.modalContent}>
                <Text style={localStyles.modalTitle}>Chọn giới tính</Text>

                {[
                  { name: "Nam", value: "male" },
                  { name: "Nữ", value: "female" },
                  { name: "Khác", value: "other" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={localStyles.modalOption}
                    onPress={() => {
                      setGender(item.value);
                      setGenderModalVisible(false);
                    }}
                  >
                    <Text style={localStyles.modalOptionText}>{item.name}</Text>

                    {gender === item.value && (
                      <Ionicons name="checkmark" size={20} color="#6A1B9A" />
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={localStyles.modalCancelButton}
                  onPress={() => setGenderModalVisible(false)}
                >
                  <Text style={localStyles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safePurple: {
    flex: 1,
    backgroundColor: "#4A148C",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B2A41",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E3EAF2",
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1B2A41",
    backgroundColor: "#F9FBFD",
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#6A1B9A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: "#F3E5F5",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6A1B9A",
    fontWeight: "700",
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#E3EAF2",
    borderRadius: 14,
    backgroundColor: "#F9FBFD",
    marginBottom: 10,
    overflow: "hidden",
  },
  picker: {
    height: 52,
    width: "100%",
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E3EAF2",
    backgroundColor: "#F9FBFD",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  genderOptionActive: {
    backgroundColor: "#6A1B9A",
    borderColor: "#6A1B9A",
  },
  genderOptionText: {
    color: "#1B2A41",
    fontWeight: "600",
    fontSize: 15,
  },
  genderOptionTextActive: {
    color: "#fff",
  },
  selectBox: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E3EAF2",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#F9FBFD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectBoxText: {
    fontSize: 15,
    color: "#1B2A41",
  },
  placeholderText: {
    color: "#90A4AE",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1B2A41",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#1B2A41",
    fontWeight: "600",
  },
  modalCancelButton: {
    marginTop: 16,
    backgroundColor: "#f5e5e5ff",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#6A1B9A",
    fontWeight: "700",
    fontSize: 15,
  },
  modalConfirmButton: {
    marginTop: 12,
    backgroundColor: "#6A1B9A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalConfirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
