import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@/components/Button';
import { Colors } from '@/constants/Colors';
import { stepOneStyles } from '../styles/ComponentStyles';

interface StepOneProps {
  recipeName: string;
  setRecipeName: (name: string) => void;
  onNext: () => void;
  errors: Record<string, string>;
}

const StepOne: React.FC<StepOneProps> = ({ 
  recipeName, 
  setRecipeName, 
  onNext, 
  errors
}) => {
  const maxCharacters = 50;

  const clearInput = () => {
    setRecipeName("");
  };

  return (
    <View style={stepOneStyles.container}>
      <View style={stepOneStyles.instructionContainer}>
        <Text style={stepOneStyles.instructionText}>
          Te llevaremos por diferentes pasos para que crees tu receta y la
          comunidad pueda verla
        </Text>
      </View>

      <View style={stepOneStyles.formContainer}>
        <Text style={stepOneStyles.fieldLabel}>Nombre</Text>
        
        <View style={stepOneStyles.inputContainer}>
          <TextInput
            style={[stepOneStyles.textInput, errors.name && stepOneStyles.textInputError]}
            value={recipeName}
            onChangeText={setRecipeName}
            placeholderTextColor={Colors.text}
            maxLength={maxCharacters}
          />
          {recipeName.length > 0 && (
            <TouchableOpacity onPress={clearInput} style={stepOneStyles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.text} />
            </TouchableOpacity>
          )}
        </View>

        {errors.name ? (
          <Text style={stepOneStyles.errorText}>{errors.name}</Text>
        ) : (
          <Text style={stepOneStyles.characterCount}>
            No puede superar los {maxCharacters} caracteres
          </Text>
        )}

        <PrimaryButton
          onPress={onNext}
          disabled={!recipeName.trim()}
          style={[
            stepOneStyles.nextButton,
            !recipeName.trim() && stepOneStyles.nextButtonDisabled,
          ]}
        >
          Siguiente
        </PrimaryButton>
      </View>
    </View>
  );
};

export default StepOne; 