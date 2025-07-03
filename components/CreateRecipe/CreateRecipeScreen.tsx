import ScreenLayout from "@/components/ScreenLayout";
import { useSync } from "@/context/sync.context";
import {
  DuplicateRecipeInfo,
  useCreateRecipeViewModel,
} from "@/viewmodels/CreateRecipeViewModel";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert } from "react-native";
import { RecipeForm, StepOne } from "./components";

export default function CreateRecipeScreen() {
  const router = useRouter();
  const { refreshUserRecipes } = useSync();

  // Función de callback para actualizar datos y navegar cuando se edite exitosamente
  const handleRecipeCreated = async () => {
    // Forzar refresh de datos en lugar de solo navegar
    await refreshUserRecipes();
    router.push("/logged/(tabs)/my-recipes");
  };

  const viewModel = useCreateRecipeViewModel(handleRecipeCreated);

  // Precargar recetas al montar el componente
  useEffect(() => {
    viewModel.preloadUserRecipes();
  }, []);

  const handleNext = async () => {
    // Verificar duplicados antes de avanzar al siguiente paso
    if (viewModel.currentStep === 1) {
      if (!viewModel.formData.name.trim()) {
        viewModel.updateFormData("name", viewModel.formData.name); // Trigger validation
        return;
      }

      try {
        const duplicateInfo: DuplicateRecipeInfo =
          await viewModel.checkForDuplicateRecipe(viewModel.formData.name);

        if (duplicateInfo.exists) {
          // Mostrar alert con opciones
          Alert.alert(
            "Receta duplicada",
            "Ya existe una receta con ese nombre.\n\n¿Qué desea hacer?",
            [
              {
                text: "Cancelar",
                style: "cancel",
              },
              {
                text: "Editar",
                onPress: () => {
                  // Cargar receta para edición
                  viewModel.loadRecipeForEditing(duplicateInfo);
                },
              },
              {
                text: "Reemplazar",
                onPress: () => {
                  // Configurar modo reemplazo (formulario en blanco)
                  viewModel.replaceRecipe(duplicateInfo);
                },
              },
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
            },
          },
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
    // Determinar el título según el modo
    const getTitle = () => {
      if (viewModel.editMode.isEditing) {
        return "Editar receta";
      } else if (
        viewModel.editMode.originalName &&
        viewModel.editMode.recipeId
      ) {
        return "Reemplazar receta";
      } else {
        return "Crear receta";
      }
    };

    return (
      <ScreenLayout alternativeHeader={{ title: getTitle() }}>
        <StepOne
          recipeName={viewModel.formData.name}
          setRecipeName={(name) => viewModel.updateFormData("name", name)}
          onNext={handleNext}
          errors={viewModel.errors}
        />
      </ScreenLayout>
    );
  }

  // Determinar el título para el paso 2
  const getTitle = () => {
    if (viewModel.editMode.isEditing) {
      return "Editar receta";
    } else if (viewModel.editMode.originalName && viewModel.editMode.recipeId) {
      return "Reemplazar receta";
    } else {
      return "Crear receta";
    }
  };

  return (
    <ScreenLayout alternativeHeader={{ title: getTitle() }}>
      <RecipeForm viewModel={viewModel} onSubmit={handleSubmit} />
    </ScreenLayout>
  );
}
