import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '@/components/ScreenLayout';
import { useCreateRecipeViewModel, DuplicateRecipeInfo } from '@/viewmodels/CreateRecipeViewModel';
import { StepOne, RecipeForm } from './components';

export default function CreateRecipeScreen() {
  const router = useRouter();
  
  // Función de callback para navegar cuando se cree exitosamente la receta
  const handleRecipeCreated = () => {
    router.push('/logged/(tabs)/my-recipes');
  };
  
  const viewModel = useCreateRecipeViewModel(handleRecipeCreated);

  const handleNext = async () => {
    // Verificar duplicados antes de avanzar al siguiente paso
    if (viewModel.currentStep === 1) {
      if (!viewModel.formData.name.trim()) {
        viewModel.updateFormData("name", viewModel.formData.name); // Trigger validation
        return;
      }

      try {
        const duplicateInfo: DuplicateRecipeInfo = await viewModel.checkForDuplicateRecipe(viewModel.formData.name);
        
        if (duplicateInfo.exists) {
          // Mostrar alert con opciones
          Alert.alert(
            "Receta duplicada",
            "Ya existe una receta con ese nombre.\n\n¿Qué desea hacer?",
            [
              {
                text: "Cancelar",
                style: "cancel"
              },
              {
                text: "Editar",
                onPress: () => {
                  // TODO: Implementar lógica de editar
                }
              },
              {
                text: "Reemplazar",
                onPress: () => {
                  // TODO: Implementar lógica de reemplazar
                }
              }
            ]
          );
          return;
        }
      } catch (error) {
        console.error("Error verificando duplicados:", error);
        // Si hay error en la verificación, continuar normalmente
      }
    }

    const success = viewModel.nextStep();
    if (!success && viewModel.currentStep === 2) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const result = await viewModel.submitRecipe();
    
    if (result && result.success) {
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
        result?.message || "Hubo un problema al crear la receta",
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