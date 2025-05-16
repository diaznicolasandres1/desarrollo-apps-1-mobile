import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { toastConfig } from "@/components/Toast";
import { AuthProvider, useAuth } from "@/context/auth.context";
import { useColorScheme } from "@/hooks/useColorScheme";
import Toast from "react-native-toast-message";
import LoginScreen from "./LoginScreen";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Routes />
        <StatusBar style="auto" />
        <Toast config={toastConfig} position="bottom" />
      </AuthProvider>
    </ThemeProvider>
  );
}

const Routes = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <LoginScreen />;
  }
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};
