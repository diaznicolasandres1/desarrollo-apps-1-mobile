import { useAuth } from "@/context/auth.context";
import { imageToBase64 } from "@/utils/imageUtils";
import { useSync } from "@/context/sync.context";
import { CreateRecipeRequest } from "@/resources/receipt";
import { useState } from "react";

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

// Mock function para simular subida de imagen
export const mockImageUpload = async (): Promise<string> => {
  // Simular delay de subida
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generar un base64 mock para simular una imagen
  // En una implementación real, esto vendría de la cámara o galería
  const mockBase64Images = [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
  ];
  
  return mockBase64Images[Math.floor(Math.random() * mockBase64Images.length)];
};

export const useCreateRecipeViewModel = (onRecipeCreated?: () => void) => {
  const { user, isGuest } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepIdCounter, setStepIdCounter] = useState(1);

  const { addReceiptToStorage } = useSync();

  // Obtener el userId del usuario autenticado o usar un valor por defecto para invitados
  const getUserId = () => {
    if (isGuest) {
      return "guest_user";
    }
    return user?._id || "anonymous_user";
  };

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

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: keyof RecipeFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
      const mapDifficulty = (difficulty: string) => {
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

      // Preparar datos para el backend
      const recipeData: CreateRecipeRequest = {
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
        status: "creating",
      };

      console.log("Enviando receta al backend...");

      await addReceiptToStorage(recipeData);
      resetForm();
      onRecipeCreated?.();
    } catch (error) {
      console.error("Error al crear receta:", error);

      let errorMessage = "Error al crear la receta";

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
  };

  return {
    // State
    currentStep,
    formData,
    isLoading,
    errors,

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
  };
};
