import ScreenLayout from "@/components/ScreenLayout";
import { Colors } from "@/constants/Colors";
import { useSync } from "@/context/sync.context";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import {
  DuplicateRecipeInfo,
  useCreateRecipeViewModel,
} from "@/viewmodels/CreateRecipeViewModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { RecipeForm, StepOne } from "./components";

export default function CreateRecipeScreen() {
  const router = useRouter();
  const { editRecipeName } = useLocalSearchParams<{
    editRecipeName?: string;
  }>();
  const { refreshUserRecipes } = useSync();
  const [isInitializing, setIsInitializing] = React.useState(!!editRecipeName);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { isConnected } = useNetworkStatus();

  // Función de callback para actualizar datos y navegar cuando se edite exitosamente
  const handleRecipeCreated = async () => {
    // Forzar refresh de datos en lugar de solo navegar
    setIsSubmitting(false);
    await refreshUserRecipes();
    router.push("/logged/(tabs)/my-recipes");
  };

  const viewModel = useCreateRecipeViewModel(handleRecipeCreated);

  // Precargar recetas y cargar para edición si viene un nombre
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Siempre precargar recetas primero
        await viewModel.preloadUserRecipes();

        // Si viene un nombre de receta para editar, usar exactamente la misma lógica del modal
        if (editRecipeName) {
          const duplicateInfo: DuplicateRecipeInfo =
            await viewModel.checkForDuplicateRecipe(editRecipeName);

          if (duplicateInfo.exists) {
            // Usar exactamente la misma función que usa el botón "Editar" del modal
            viewModel.loadRecipeForEditing(duplicateInfo);
          } else {
            Alert.alert("Error", "No se pudo encontrar la receta para editar", [
              { text: "OK", onPress: () => router.back() },
            ]);
          }
        }
      } catch (error) {
        console.error("Error loading recipe for editing:", error);
        if (editRecipeName) {
          Alert.alert("Error", "Hubo un problema al cargar la receta", [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      } finally {
        // Marcar que terminó la inicialización
        setIsInitializing(false);
      }
    };

    initializeComponent();
  }, [editRecipeName]);

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
    setIsSubmitting(true);

    try {
      const result = await viewModel.submitRecipe();

      if (result && result.success) {
        // Si viene del lápiz (editRecipeName), navegar directamente sin Alert
        if (editRecipeName) {
          // La navegación ya se maneja en el callback del ViewModel
          return;
        }

        if (!isConnected) {
          Alert.alert(
            "No tenés conexión",
            "Pero no te preocupes, la receta se guardará en tu dispositivo y se sincronizará cuando vuelvas a estar conectado.",
            [{ text: "OK" }]
          );
          return;
        } else {
          Alert.alert(
            "¡Listo!",
            result.message || "Tu receta ha sido publicada exitosamente",
            [
              {
                text: "Ver mis recetas",
                onPress: () => {
                  router.push("/logged/(tabs)/my-recipes");
                },
              },
            ]
          );
        }
      } else {
        Alert.alert(
          "Error",
          result?.message || "Hubo un problema al crear la receta",
          [{ text: "OK" }]
        );
        setIsSubmitting(false);
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al crear la receta", [
        { text: "OK" },
      ]);
      setIsSubmitting(false);
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

  // Mostrar loading mientras se inicializa
  if (isInitializing) {
    return (
      <ScreenLayout alternativeHeader={{ title: "Cargando..." }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <ActivityIndicator size="large" color={Colors.orange.orange900} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: Colors.text,
            }}
          >
            Cargando receta...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  // Mostrar loading mientras se guarda
  if (isSubmitting) {
    return (
      <ScreenLayout alternativeHeader={{ title: "Guardando..." }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <ActivityIndicator size="large" color={Colors.orange.orange900} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: Colors.text,
            }}
          >
            Guardando receta...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

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
