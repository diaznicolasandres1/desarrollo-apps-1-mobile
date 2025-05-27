import ScreenLayout from "@/components/ScreenLayout";
import { PrimaryButton } from "@/components/Button";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateRecipeScreen() {
  const [recipeName, setRecipeName] = useState("");
  const maxCharacters = 50;

  const handleNext = () => {
    if (recipeName.trim()) {
      console.log("Nombre de receta:", recipeName);
      // Aquí se implementará la navegación al siguiente paso
    }
  };

  const clearInput = () => {
    setRecipeName("");
  };

  return (
    <ScreenLayout
      alternativeHeader={{
        title: "Crear receta",
      }}
    >
      <View style={styles.container}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Te llevaremos por diferentes pasos para que crees tu receta y la
            comunidad pueda verla
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.fieldLabel}>Nombre</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={recipeName}
              onChangeText={setRecipeName}
              placeholderTextColor={Colors.text}
              maxLength={maxCharacters}
            />
            {recipeName.length > 0 && (
              <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={Colors.text} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.characterCount}>
            No puede superar los {maxCharacters} caracteres
          </Text>

          <PrimaryButton
            onPress={handleNext}
            disabled={!recipeName.trim()}
            style={[
              styles.nextButton,
              !recipeName.trim() && styles.nextButtonDisabled,
            ]}
          >
            Siguiente
          </PrimaryButton>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  instructionContainer: {
    backgroundColor: Colors.orange.orange200,
    padding: 16,
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 16,
    color: Colors.orange.orange900,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "white",
    borderRadius: 0,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    paddingRight: 45,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text,
    paddingLeft: 16,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  characterCount: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
    marginBottom: 32,
  },
  nextButton: {
    marginHorizontal: 20,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
});
