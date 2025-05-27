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
  userName: string;
  category: string[];
  duration: number;
  difficulty: "facil" | "media" | "dificil" | "";
  servings: number;
}

// Mock function para simular subida de imagen
export const mockImageUpload = async (): Promise<string> => {
  // Simular delay de subida
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Retornar URL mock de imagen
  const mockImages = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400"
  ];
  
  return mockImages[Math.floor(Math.random() * mockImages.length)];
};

export const useCreateRecipeViewModel = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RecipeFormData>({
    name: "",
    description: "",
    ingredients: [],
    steps: [],
    principalPictures: [],
    userName: "usuario123", // Mock user
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
  const addStep = (step: Omit<Step, 'id'>) => {
    const newStep: Step = {
      ...step,
      id: Date.now().toString(),
    };
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
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
      steps: prev.steps.map((item, i) => 
        i === index ? step : item
      ),
    }));
  };

  // Imágenes principales
  const addPrincipalPicture = async (description: string = "") => {
    setIsLoading(true);
    try {
      const url = await mockImageUpload();
      const newPicture: PrincipalPicture = { url, description };
      setFormData((prev) => ({
        ...prev,
        principalPictures: [...prev.principalPictures, newPicture],
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
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

  const submitRecipe = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Aquí se implementará la llamada al backend
      console.log("Enviando receta:", JSON.stringify(formData, null, 2));
      
      // Simular llamada al API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.error("Error al crear receta:", error);
      return false;
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
      userName: "usuario123",
      category: [],
      duration: 0,
      difficulty: "",
      servings: 0,
    });
    setCurrentStep(1);
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