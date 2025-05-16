import { PrimaryButton } from "@/components/Button";
import { SimpleInput } from "@/components/Input";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, StyleSheet, Text, View } from "react-native";
import { TextInput as PaperTextInput } from "react-native-paper";

const PasswordRecoveryCodeScreen: React.FC = () => {
  const router = useRouter();
  const { onValidateCode } = useAuth();

  const { control, handleSubmit, watch } = useForm<{
    code: string;
  }>({
    defaultValues: {
      code: "123456",
    },
  });

  const onSubmit = () => {
    const { code } = watch();
    if (!code) {
      return;
    }

    const isCodeValid = onValidateCode(code);
    if (isCodeValid) {
      router.push("/recover/new-password");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/logo.png")} style={styles.icon} />
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Controller
        control={control}
        name="code"
        defaultValue=""
        render={({ field: { onChange, onBlur, value } }) => (
          <SimpleInput
            label="Ingrese los 6 digitos"
            helperText="Ingrese el codigo recibido por email"
            onBlur={onBlur}
            onChangeText={onChange}
            maxLength={6}
            value={value}
            keyboardType="numeric"
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
      <PrimaryButton onPress={handleSubmit(onSubmit)}>
        Verificar código
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
    fontSize: 24,
    color: Colors.orange.orange900,
    marginBottom: 20,
    fontWeight: "bold",
  },
});

export default PasswordRecoveryCodeScreen;
