import { PrimaryButton } from "@/components/Button";
import { SimpleInput } from "@/components/Input";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, StyleSheet, Text, View } from "react-native";
import { TextInput as PaperTextInput } from "react-native-paper";
import Toast from "react-native-toast-message";

const PasswordRecoveryNewPasswordScreen: React.FC = () => {
  const { isConnected } = useNetworkStatus();
  const router = useRouter();
  const { onNewPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, watch } = useForm<{
    password: string;
    confirmPassword: string;
  }>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async () => {
    if (!isConnected) {
      Toast.show({
        type: "error",
        text1: "No hay conexión a internet",
      });
      return;
    }
    const { password, confirmPassword } = watch();

    if (!password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Las contraseñas no coinciden",
      });
      return;
    }

    setIsLoading(true);
    const success = await onNewPassword(password);
    setIsLoading(false);

    if (success) {
      router.push("/");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/logo.png")} style={styles.icon} />
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Controller
        control={control}
        name="password"
        defaultValue=""
        render={({ field: { onChange, onBlur, value } }) => (
          <SimpleInput
            label="Nueva contraseña"
            helperText="Ingrese su nueva contraseña"
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
      <Controller
        control={control}
        name="confirmPassword"
        defaultValue=""
        render={({ field: { onChange, onBlur, value } }) => (
          <SimpleInput
            label="Confirmar contraseña"
            helperText="Vuelva a ingresar su nueva contraseña"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry={!showConfirmPassword}
            right={
              <PaperTextInput.Icon
                icon={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                onPress={() => {
                  setShowConfirmPassword(!showConfirmPassword);
                }}
              />
            }
          />
        )}
      />
      <PrimaryButton onPress={handleSubmit(onSubmit)} loading={isLoading}>
        Guardar
      </PrimaryButton>
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
  title: {
    fontWeight: "bold",
    fontSize: 24,
    color: Colors.orange.orange900,
    marginBottom: 20,
  },
});

export default PasswordRecoveryNewPasswordScreen;
