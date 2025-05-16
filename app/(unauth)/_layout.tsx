import { Stack } from "expo-router";

export default function UnauthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="recover/email" />
      <Stack.Screen name="recover/code" />
      <Stack.Screen name="recover/new-password" />
      <Stack.Screen name="recover/success" />
    </Stack>
  );
}
