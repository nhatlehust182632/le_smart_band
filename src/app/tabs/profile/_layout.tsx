import { Stack } from "expo-router";
import React from "react";
import { ProfileProvider } from "../../../hooks/profile-context";

export default function ProfileLayout() {
  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="edit" />
      </Stack>
    </ProfileProvider>
  );
}
