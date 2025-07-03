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
  
  const viewModel = useCreateRecipeViewModel(handleRecipeCreated);

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

  const handleBackNavigation = () => {
    if (viewModel.currentStep === 1) {
      // En el primer paso, volver al home
      router.back();
    } else {
      // En pasos posteriores, volver al paso anterior
      viewModel.previousStep();
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
    <ScreenLayout alternativeHeader={{ 
      title: "Crear receta",
      onBackPress: handleBackNavigation
    }}>
      <RecipeForm 
        viewModel={viewModel}
        onSubmit={handleSubmit}
      />
    </ScreenLayout>
  );
} 