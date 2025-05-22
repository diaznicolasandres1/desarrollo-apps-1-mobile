import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { toastConfig } from "@/components/Toast";
import { AuthProvider } from "@/context/auth.context";
import { Provider } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Provider theme={{ mode: "exact" }}>
        <AuthProvider>
          <Routes />
          <StatusBar style="dark" />
          <Toast config={toastConfig} position="bottom" />
        </AuthProvider>
      </Provider>
    </ThemeProvider>
  );
}

const Routes = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="logged" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};
