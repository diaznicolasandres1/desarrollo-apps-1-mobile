import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '@/components/ScreenLayout';
import { useCreateRecipeViewModel } from '@/viewmodels/CreateRecipeViewModel';
import { StepOne, RecipeForm } from './components';

export default function CreateRecipeScreen() {
  const router = useRouter();
  
  // Función de callback para navegar cuando se cree exitosamente la receta
  const handleRecipeCreated = () => {
    router.push('/logged/(tabs)/my-recipes');
  };
  
  const showDuplicateRecipeModal = () => {
    Alert.alert(
      "La receta ya existe",
      "Ya tienes una receta con este nombre. ¿Qué deseas hacer?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Editarla",
          onPress: () => {
            // TODO: Navegar a editar la receta existente
            console.log("Navegar a editar receta existente");
          }
        },
        {
          text: "Reemplazarla", 
          onPress: () => {
            // TODO: Reemplazar la receta existente
            console.log("Reemplazar receta existente");
          },
          style: "destructive"
        }
      ]
    );
  };

  const viewModel = useCreateRecipeViewModel(handleRecipeCreated, showDuplicateRecipeModal);

  const handleNext = () => {
    const success = viewModel.nextStep();
    if (!success && viewModel.currentStep === 2) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const result = await viewModel.submitRecipe();
    
    if (result.success) {
      Alert.alert(
        "¡Receta creada!",
        result.message || "Tu receta ha sido publicada exitosamente",
        [
          { 
            text: "Ver mis recetas", 
            onPress: () => {
              // La navegación ya se maneja en el callback del ViewModel
            }
          }
        ]
      );
    } else {
      Alert.alert(
        "Error",
        result.message || "Hubo un problema al crear la receta",
        [{ text: "OK" }]
      );
    }
  };

  if (viewModel.currentStep === 1) {
    return (
      <ScreenLayout alternativeHeader={{ title: "Crear receta" }}>
        <StepOne
          recipeName={viewModel.formData.name}
          setRecipeName={(name) => viewModel.updateFormData("name", name)}
          onNext={handleNext}
          errors={viewModel.errors}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout alternativeHeader={{ title: "Crear receta" }}>
      <RecipeForm 
        viewModel={viewModel}
        onSubmit={handleSubmit}
      />
    </ScreenLayout>
  );
} 