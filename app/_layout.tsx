import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { toastConfig } from "@/components/Toast";
import { AuthProvider } from "@/context/auth.context";
import { SyncProvider } from "@/context/sync.context";
import { Slot } from "expo-router";
import { Provider } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Provider theme={{ mode: "exact" }}>
        <AuthProvider>
          <SyncProvider>
            <StatusBar style="dark" />
            <Slot />
            <Toast config={toastConfig} position="bottom" />
          </SyncProvider>
        </AuthProvider>
      </Provider>
    </ThemeProvider>
  );
}
