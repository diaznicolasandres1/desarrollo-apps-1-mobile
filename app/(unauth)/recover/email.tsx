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

const PasswordRecoveryEmailScreen: React.FC = () => {
  const { isConnected } = useNetworkStatus();
  const router = useRouter();
  const { onRecoveryCode } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, watch } = useForm<{
    email: string;
  }>({
    defaultValues: {
      email: "",
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
    const { email } = watch();

    if (!email) {
      return;
    }

    setIsLoading(true);
    const success = await onRecoveryCode(email);
    setIsLoading(false);

    if (success) {
      router.push("/recover/code");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/logo.png")} style={styles.icon} />
      <Text style={styles.title}>Recuperar contraseña</Text>
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
      <PrimaryButton onPress={handleSubmit(onSubmit)} loading={isLoading}>
        Enviar código
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

export default PasswordRecoveryEmailScreen;
