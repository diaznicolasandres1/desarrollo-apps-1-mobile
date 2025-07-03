import { useAuth } from "@/context/auth.context";
import { useSync } from "@/context/sync.context";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { CreateRecipeRequest, RecipeDetail } from "@/resources/receipt";
import { useState } from "react";
import { Image } from "react-native";

export interface Ingredient {
  name: string;
  quantity: number;
  measureType: string;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  mediaResource?: string;
}

export interface PrincipalPicture {
  url: string;
  description: string;
}

export interface RecipeFormData {
  name: string;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  principalPictures: PrincipalPicture[];
  userId: string;
  category: string[];
  duration: number;
  difficulty: "facil" | "media" | "dificil" | "";
  servings: number;
}

// Nuevo tipo para manejar duplicados
export interface DuplicateRecipeInfo {
  exists: boolean;
  serverRecipe?: RecipeDetail;
  pendingRecipe?: CreateRecipeRequest;
  pendingRecipeIndex?: number;
}

// Nuevo tipo para el modo de edición
export interface EditMode {
  isEditing: boolean;
  editingType: "pending" | "server" | "none";
  originalName?: string;
  recipeId?: string;
  originalStatus?: string;
}

// Mock function para simular subida de imagen
export const mockImageUpload = async (): Promise<string> => {
  // Simular delay de subida
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Imágenes principales desde assets locales
  const principalImages = [
    require("@/assets/images/pastas.png"), // Imagen principal 1
  ];

  const randomImage =
    principalImages[Math.floor(Math.random() * principalImages.length)];

  // Convertir require() a URI usando Image.resolveAssetSource
  const resolvedSource = Image.resolveAssetSource(randomImage);

  return resolvedSource.uri;
};

export const useCreateRecipeViewModel = (onRecipeCreated?: () => void) => {
  const { isConnected } = useNetworkStatus();
  const { user, isGuest } = useAuth();
  const {
    addReceiptToStorage,
    updateReceiptInStorage,
    getReceiptsInStorage,
    allUserRecipes,
    refreshUserRecipes,
    replaceRecipeInStorage,
  } = useSync();

  // Obtener el userId del usuario autenticado o usar un valor por defecto para invitados
  const getUserId = () => {
    if (isGuest) {
      return "guest_user";
    }
    return user?._id || "anonymous_user";
  };

  // Estado del formulario
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<RecipeFormData>({
    name: "",
    description: "",
    ingredients: [],
    steps: [],
    principalPictures: [],
    userId: getUserId(),
    category: [],
    duration: 0,
    difficulty: "",
    servings: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepIdCounter, setStepIdCounter] = useState<number>(1);

  // Estado para modo edición
  const [editMode, setEditMode] = useState<EditMode>({
    isEditing: false,
    editingType: "none",
    originalName: undefined,
    recipeId: undefined,
    originalStatus: undefined,
  });

  // Estado para tracking de datos precargados
  const [recipesPreloaded, setRecipesPreloaded] = useState(false);

  const updateFormData = (field: keyof RecipeFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo al editarlo
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Función para precargar recetas - ahora usa el estado unificado
  const preloadUserRecipes = async () => {
    if (!recipesPreloaded) {
      await refreshUserRecipes();
      setRecipesPreloaded(true);
    }
  };

  // Nueva función para verificar duplicados usando SOLO datos precargados (offline-first)
  const checkForDuplicateRecipe = async (
    recipeName: string
  ): Promise<DuplicateRecipeInfo> => {
    const trimmedName = recipeName.trim().toLowerCase();

    if (!trimmedName) {
      return { exists: false };
    }

    // Si las recetas aún no están precargadas, intentar precargarlas (sin bloquear si falla)
    if (!recipesPreloaded) {
      try {
        await preloadUserRecipes();
      } catch (error) {
        // Si falla el preload, continuamos con lo que tengamos
      }
    }

    try {
      // Verificar en storage local (recetas pendientes)
      let pendingRecipe: CreateRecipeRequest | undefined;
      let pendingRecipeIndex: number | undefined;

      pendingRecipeIndex = allUserRecipes.pendingRecipes.findIndex(
        (recipe) => recipe.name.trim().toLowerCase() === trimmedName
      );
      if (pendingRecipeIndex !== -1) {
        pendingRecipe = allUserRecipes.pendingRecipes[pendingRecipeIndex];
      }

      // Verificar en recetas del servidor desde el estado compartido
      let serverRecipe: RecipeDetail | undefined;
      serverRecipe = allUserRecipes.serverRecipes.find(
        (recipe) => recipe.name.trim().toLowerCase() === trimmedName
      );

      return {
        exists: !!(pendingRecipe || serverRecipe),
        serverRecipe,
        pendingRecipe,
        pendingRecipeIndex:
          pendingRecipeIndex !== -1 ? pendingRecipeIndex : undefined,
      };
    } catch (error) {
      return { exists: false };
    }
  };

  // Nueva función para cargar receta existente en modo edición
  const loadRecipeForEditing = (duplicateInfo: DuplicateRecipeInfo) => {
    try {
      console.log("=== LOADING RECIPE FOR EDITING ===");
      console.log("Duplicate info:", duplicateInfo);

      // Storage local SIEMPRE tiene prioridad (contiene la verdad)
      if (duplicateInfo.pendingRecipe) {
        const pending = duplicateInfo.pendingRecipe;

        // Mapear dificultad de vuelta al formato del form
        const mapDifficultyBack = (difficulty: string) => {
          switch (difficulty) {
            case "Fácil":
              return "facil";
            case "Medio":
              return "media";
            case "Difícil":
              return "dificil";
            default:
              return "media";
          }
        };

        setFormData({
          name: pending.name,
          description: pending.description,
          ingredients: pending.ingredients,
          steps: pending.steps,
          principalPictures: pending.principalPictures,
          userId: pending.userId,
          category: pending.category,
          duration: pending.duration,
          difficulty: mapDifficultyBack(pending.difficulty),
          servings: pending.servings,
        });

        setEditMode({
          isEditing: true,
          editingType: "pending",
          originalName: pending.name,
          recipeId: pending.isUpdate ? pending.originalRecipeId : undefined,
          originalStatus: pending.status,
        });
      } else if (duplicateInfo.serverRecipe) {
        // Solo usar receta del servidor si NO hay versión en storage local
        const server = duplicateInfo.serverRecipe;

        // Mapear dificultad de vuelta al formato del form
        const mapDifficultyBack = (difficulty: string) => {
          switch (difficulty) {
            case "Fácil":
              return "facil";
            case "Medio":
              return "media";
            case "Difícil":
              return "dificil";
            default:
              return "media";
          }
        };

        setFormData({
          name: server.name,
          description: server.description,
          ingredients: server.ingredients,
          steps: server.steps,
          principalPictures: server.principalPictures,
          userId: server.userId,
          category: server.category,
          duration: server.duration,
          difficulty: mapDifficultyBack(server.difficulty),
          servings: server.servings,
        });

        setEditMode({
          isEditing: true,
          editingType: "server",
          originalName: server.name,
          recipeId: server._id,
          originalStatus: server.status,
        });
      }

      // Avanzar al paso 2 automáticamente
      setCurrentStep(2);
    } catch (error) {
      console.error("Error cargando receta para edición:", error);
    }
  };

  const replaceRecipe = async (duplicateInfo: DuplicateRecipeInfo) => {
    try {
      console.log("=== REPLACE RECIPE ===");
      console.log("Duplicate info:", duplicateInfo);
      console.log("Is connected:", isConnected);

      // Mantener el nombre actual, limpiar solo el resto de campos
      setFormData((prev) => ({
        name: prev.name, // ¡MANTENER EL NOMBRE!
        description: "",
        ingredients: [],
        steps: [],
        principalPictures: [],
        userId: getUserId(),
        category: [],
        duration: 0,
        difficulty: "",
        servings: 0,
      }));

      // Configurar modo reemplazo sin resetear completamente
      if (duplicateInfo.pendingRecipe) {
        setEditMode({
          isEditing: false, // Formulario para nueva receta
          editingType: "none",
          originalName: duplicateInfo.pendingRecipe.name,
          recipeId:
            duplicateInfo.pendingRecipe.originalRecipeId ||
            duplicateInfo.pendingRecipe.name,
          originalStatus: duplicateInfo.pendingRecipe.status,
        });
      } else if (duplicateInfo.serverRecipe) {
        setEditMode({
          isEditing: false, // Formulario para nueva receta
          editingType: "none",
          originalName: duplicateInfo.serverRecipe.name,
          recipeId: duplicateInfo.serverRecipe._id,
          originalStatus: duplicateInfo.serverRecipe.status,
        });
      }

      // Ir directamente al paso 2 - formulario completo con nombre preservado
      setCurrentStep(2);
    } catch (error) {
      console.error("Error configurando reemplazo de receta:", error);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = "El nombre de la receta es obligatorio";
        }
        if (formData.name.length > 50) {
          newErrors.name = "El nombre no puede superar los 50 caracteres";
        }
        break;
      case 2:
        if (!formData.description.trim()) {
          newErrors.description = "La descripción es obligatoria";
        }
        if (formData.duration <= 0) {
          newErrors.duration = "El tiempo debe ser mayor a 0";
        }
        if (formData.servings <= 0) {
          newErrors.servings = "Las porciones deben ser mayor a 0";
        }
        if (formData.ingredients.length === 0) {
          newErrors.ingredients = "Debe agregar al menos un ingrediente";
        }
        if (formData.steps.length === 0) {
          newErrors.steps = "Debe agregar al menos un paso";
        }
        if (!formData.difficulty) {
          newErrors.difficulty = "Debe seleccionar una dificultad";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = (): boolean => {
    if (validateStep(currentStep)) {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
        return true;
      }
    }
    return false;
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Ingredientes
  const addIngredient = (ingredient: Ingredient) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredient],
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateIngredient = (index: number, ingredient: Ingredient) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((item, i) =>
        i === index ? ingredient : item
      ),
    }));
  };

  // Pasos
  const addStep = (step: Omit<Step, "id">) => {
    const newStep: Step = {
      ...step,
      id: stepIdCounter.toString(),
    };
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
    setStepIdCounter((prev) => prev + 1);
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const updateStep = (index: number, step: Step) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((item, i) => (i === index ? step : item)),
    }));
  };

  // Imágenes principales
  const addPrincipalPicture = async (description: string = "") => {
    setIsLoading(true);
    try {
      const base64Image = await mockImageUpload();
      const newPicture: PrincipalPicture = { url: base64Image, description };
      setFormData((prev) => ({
        ...prev,
        principalPictures: [...prev.principalPictures, newPicture],
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrors((prev) => ({
        ...prev,
        image: "Error al subir la imagen",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const removePrincipalPicture = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      principalPictures: prev.principalPictures.filter((_, i) => i !== index),
    }));
  };

  // Categorías
  const addCategory = (category: string) => {
    if (category.trim() && !formData.category.includes(category.trim())) {
      setFormData((prev) => ({
        ...prev,
        category: [...prev.category, category.trim()],
      }));
    }
  };

  const removeCategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.filter((_, i) => i !== index),
    }));
  };

  const submitRecipe = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Validar datos antes de enviar
      if (!validateStep(2)) {
        return {
          success: false,
          message: "Por favor completa todos los campos obligatorios",
        };
      }

      // Mapear dificultad al formato esperado por el backend
      const mapDifficulty = (
        difficulty: string
      ): "Fácil" | "Medio" | "Difícil" => {
        switch (difficulty) {
          case "facil":
            return "Fácil";
          case "media":
            return "Medio";
          case "dificil":
            return "Difícil";
          default:
            return "Medio";
        }
      };

      // Preparar datos base para el backend
      const baseRecipeData = {
        name: formData.name,
        description: formData.description,
        ingredients: formData.ingredients,
        steps: formData.steps,
        principalPictures: formData.principalPictures,
        userId: formData.userId,
        category: formData.category,
        duration: formData.duration,
        difficulty: mapDifficulty(formData.difficulty),
        servings: formData.servings,
      };

      // Manejar según modo de edición
      if (editMode.isEditing) {
        if (editMode.editingType === "pending") {
          // Editar receta pendiente en storage - mantener status original
          const recipeData: CreateRecipeRequest = {
            ...baseRecipeData,
            status: editMode.originalStatus || "creating", // Usar status original guardado
          };

          await updateReceiptInStorage(editMode.originalName!, recipeData);

          resetForm();
          onRecipeCreated?.();

          return {
            success: true,
            message: "Receta actualizada exitosamente",
          };
        } else if (editMode.editingType === "server") {
          // Editar receta del servidor - mantener status original
          const recipeData: CreateRecipeRequest = {
            ...baseRecipeData,
            status: editMode.originalStatus || "creating", // Usar status original guardado
            isUpdate: true,
            originalRecipeId: editMode.recipeId,
          };

          await addReceiptToStorage(recipeData);

          resetForm();
          onRecipeCreated?.();

          return {
            success: true,
            message: "Receta actualizada exitosamente",
          };
        }
      } else if (editMode.originalName && editMode.recipeId) {
        // MODO REEMPLAZO: Formulario en blanco pero tiene originalName y recipeId configurados
        console.log("=== SUBMIT RECIPE - MODO REEMPLAZO ===");
        console.log("Original name:", editMode.originalName);
        console.log("Recipe ID:", editMode.recipeId);
        console.log("Is connected:", isConnected);

        if (isConnected) {
          // **REEMPLAZO ONLINE**: Eliminar anterior + crear nueva
          const recipeData: CreateRecipeRequest = {
            ...baseRecipeData,
            status: "creating",
            isReplacement: true,
            recipeToReplaceId: editMode.recipeId,
          };

          await addReceiptToStorage(recipeData);

          resetForm();
          onRecipeCreated?.();

          if (!isConnected) {
            return {
              success: true,
              message:
                "No tenés conexión, pero la receta será reemplazada cuando vuelvas a estar en línea.",
            };
          } else {
            return {
              success: true,
              message: "La receta será reemplazada.",
            };
          }
        } else {
          // **REEMPLAZO OFFLINE**: Usar función específica de reemplazo
          const recipeData: CreateRecipeRequest = {
            ...baseRecipeData,
            status: editMode.originalStatus || "creating",
          };

          await replaceRecipeInStorage(editMode.recipeId, recipeData);

          resetForm();
          onRecipeCreated?.();

          return {
            success: true,
            message: "Receta reemplazada exitosamente",
          };
        }
      } else {
        // Crear nueva receta (modo normal)
        const recipeData: CreateRecipeRequest = {
          ...baseRecipeData,
          status: "creating",
        };

        await addReceiptToStorage(recipeData);

        resetForm();
        onRecipeCreated?.();

        return { success: true, message: "Receta guardada exitosamente" };
      }
    } catch (error) {
      console.error("Error al procesar receta:", error);

      let errorMessage = "Error al procesar la receta";

      if (error instanceof Error) {
        if (error.message.includes("HTTP 400")) {
          errorMessage =
            "Datos inválidos. Por favor revisa la información ingresada.";
        } else if (error.message.includes("HTTP 401")) {
          errorMessage = "No autorizado. Por favor inicia sesión nuevamente.";
        } else if (error.message.includes("HTTP 500")) {
          errorMessage = "Error del servidor. Por favor intenta más tarde.";
        } else {
          errorMessage = error.message;
        }
      }

      setErrors({ submit: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      ingredients: [],
      steps: [],
      principalPictures: [],
      userId: getUserId(),
      category: [],
      duration: 0,
      difficulty: "",
      servings: 0,
    });
    setCurrentStep(1);
    setStepIdCounter(1);
    setErrors({});
    // Reset del modo edición
    setEditMode({
      isEditing: false,
      editingType: "none",
      originalName: undefined,
      recipeId: undefined,
      originalStatus: undefined,
    });
  };

  return {
    // State
    currentStep,
    formData,
    isLoading,
    errors,
    editMode,
    recipesPreloaded,

    // Actions
    updateFormData,
    nextStep,
    previousStep,
    addIngredient,
    removeIngredient,
    updateIngredient,
    addStep,
    removeStep,
    updateStep,
    addPrincipalPicture,
    removePrincipalPicture,
    addCategory,
    removeCategory,
    submitRecipe,
    resetForm,
    validateStep,

    // Nuevas funciones para duplicados y edición
    checkForDuplicateRecipe,
    loadRecipeForEditing,
    preloadUserRecipes,
    replaceRecipe,
  };
};
