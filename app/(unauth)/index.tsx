import { PrimaryButton, SecondaryButton } from "@/components/Button";
import { SimpleInput } from "@/components/Input";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, StyleSheet, View } from "react-native";
import { TextInput as PaperTextInput } from "react-native-paper";
import Toast from "react-native-toast-message";

const LoginScreen: React.FC = () => {
  const { login, isLoading, loginAsGuest } = useAuth();
  const { isConnected } = useNetworkStatus();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, watch } = useForm<{
    email: string;
    password: string;
  }>({
    defaultValues: {
      email: "full@test.com",
      password: "123456",
    },
  });

  const onSubmit = () => {
    if (!isConnected) {
      Toast.show({
        type: "error",
        text1: "No hay conexión a internet",
      });
      return;
    }
    const { email, password } = watch();
    login(email, password);
  };

  const onGuestLogin = () => {
    if (!isConnected) {
      Toast.show({
        type: "error",
        text1: "No hay conexión a internet",
      });
      return;
    }
    loginAsGuest();
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/(tabs)");
    }
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/logo.png")} style={styles.icon} />
      <Controller
        control={control}
        name="email"
        defaultValue=""
        render={({ field: { onChange, onBlur, value } }) => (
          <SimpleInput
            label="Email"
            helperText="El email con el que te registraste"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="email-address"
            autoCapitalize="none"
            right={
              <PaperTextInput.Icon
                icon="close-circle-outline"
                onPress={() => {
                  onChange("");
                }}
              />
            }
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        defaultValue=""
        render={({ field: { onChange, onBlur, value } }) => (
          <SimpleInput
            label="Contraseña"
            helperText="Ingrese su contraseña"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry={!showPassword}
            right={
              <PaperTextInput.Icon
                icon={showPassword ? "eye-outline" : "eye-off-outline"}
                onPress={() => {
                  setShowPassword(!showPassword);
                }}
              />
            }
          />
        )}
      />
      <View style={{ gap: 10 }}>
        <PrimaryButton onPress={handleSubmit(onSubmit)} loading={isLoading}>
          Iniciar Sesión
        </PrimaryButton>
        <PrimaryButton
          mode="text"
          textColor={Colors.orange.orange900}
          style={{ backgroundColor: "transparent" }}
          onPress={() => router.push("/(unauth)/recover/email")}
        >
          Recuperar contraseña
        </PrimaryButton>
        <SecondaryButton onPress={onGuestLogin}>
          Ingresar como invitado
        </SecondaryButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.orange.orange50,
    padding: 16,
    gap: 40,
  },
  icon: {
    width: 138,
    height: 138,
    marginBottom: 20,
  },
});

export default LoginScreen;
