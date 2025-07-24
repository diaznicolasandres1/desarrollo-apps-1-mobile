import { Ingredient, RecipeDetail } from "@/resources/receipt";
import { useCallback, useState } from "react";

export type PortionAdjustmentType = "half" | "double" | "custom" | "ingredient";

export interface PortionAdjustmentState {
  selectedType: PortionAdjustmentType;
  customPortions: string;
  selectedIngredientIndex: number;
  newIngredientQuantity: string;
  currentMultiplier: number;
}

export interface IngredientAdjustment {
  name: string;
  originalQuantity: number;
  newQuantity: number;
}

export interface AdjustmentDetails {
  originalServings: number;
  newServings: number;
  multiplier: number;
  adjustedIngredient?: IngredientAdjustment;
}

export const usePortionAdjustment = (recipe: RecipeDetail | null) => {
  const [state, setState] = useState<PortionAdjustmentState>({
    selectedType: "custom",
    customPortions: "",
    selectedIngredientIndex: -1,
    newIngredientQuantity: "",
    currentMultiplier: 1,
  });

  // Resetear estado cuando se abre el modal
  const resetState = useCallback(() => {
    setState({
      selectedType: "custom",
      customPortions: recipe?.servings.toString() || "",
      selectedIngredientIndex: -1,
      newIngredientQuantity: "",
      currentMultiplier: 1,
    });
  }, [recipe?.servings]);

  // Cambiar tipo de ajuste
  const setAdjustmentType = useCallback(
    (type: PortionAdjustmentType) => {
      setState((prev) => {
        const newState = { ...prev, selectedType: type };

        if (type === "half") {
          newState.customPortions = Math.ceil(
            (recipe?.servings || 1) / 2
          ).toString();
        } else if (type === "double") {
          newState.customPortions = ((recipe?.servings || 1) * 2).toString();
        } else if (type === "ingredient") {
          newState.selectedIngredientIndex = -1;
          newState.newIngredientQuantity = "";
        }

        return newState;
      });
    },
    [recipe?.servings]
  );

  // Seleccionar ingrediente
  const selectIngredient = useCallback(
    (index: number) => {
      setState((prev) => ({
        ...prev,
        selectedIngredientIndex: index,
        newIngredientQuantity:
          recipe?.ingredients[index]?.quantity.toString() || "",
      }));
    },
    [recipe?.ingredients]
  );

  // Cambiar cantidad personalizada
  const setCustomPortions = useCallback((portions: string) => {
    setState((prev) => ({
      ...prev,
      customPortions: portions,
      selectedType: "custom",
    }));
  }, []);

  // Cambiar cantidad de ingrediente
  const setIngredientQuantity = useCallback((quantity: string) => {
    setState((prev) => ({
      ...prev,
      newIngredientQuantity: quantity,
    }));
  }, []);

  // Calcular multiplicador y aplicar ajustes
  const applyAdjustment = useCallback(() => {
    let multiplier = 1;

    if (
      state.selectedType === "ingredient" &&
      state.selectedIngredientIndex >= 0
    ) {
      // Calcular proporción basada en el ingrediente seleccionado
      const originalIngredient =
        recipe?.ingredients[state.selectedIngredientIndex];
      const newQuantity = parseFloat(state.newIngredientQuantity) || 0;

      if (originalIngredient && newQuantity > 0) {
        multiplier = newQuantity / originalIngredient.quantity;
      }
    } else {
      // Calcular proporción basada en porciones
      const newPortions = parseInt(state.customPortions) || 1;
      const originalPortions = recipe?.servings || 1;
      multiplier = newPortions / originalPortions;
    }

    setState((prev) => ({
      ...prev,
      currentMultiplier: multiplier,
    }));

    return multiplier;
  }, [state, recipe]);

  // Obtener ingredientes ajustados
  const getAdjustedIngredients = useCallback(
    (multiplier?: number): Ingredient[] => {
      if (!recipe?.ingredients) return [];

      const mult = multiplier || state.currentMultiplier;
      return recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        quantity: ingredient.quantity * mult,
      }));
    },
    [recipe?.ingredients, state.currentMultiplier]
  );

  // Obtener detalles del ajuste para guardar
  const getAdjustmentDetails = useCallback((): AdjustmentDetails => {
    const details: AdjustmentDetails = {
      originalServings: recipe?.servings || 1,
      newServings: Math.round(
        (recipe?.servings || 1) * state.currentMultiplier
      ),
      multiplier: state.currentMultiplier,
    };

    if (
      state.selectedType === "ingredient" &&
      state.selectedIngredientIndex >= 0 &&
      recipe?.ingredients[state.selectedIngredientIndex]
    ) {
      details.adjustedIngredient = {
        name: recipe.ingredients[state.selectedIngredientIndex].name,
        originalQuantity:
          recipe.ingredients[state.selectedIngredientIndex].quantity,
        newQuantity: parseFloat(state.newIngredientQuantity) || 0,
      };
    }

    return details;
  }, [state, recipe]);

  // Validar si se puede aplicar el ajuste
  const canApplyAdjustment = useCallback((): boolean => {
    if (state.selectedType === "ingredient") {
      return (
        state.selectedIngredientIndex >= 0 &&
        parseFloat(state.newIngredientQuantity) > 0
      );
    }
    return parseInt(state.customPortions) > 0;
  }, [state]);

  return {
    state,
    resetState,
    setAdjustmentType,
    selectIngredient,
    setCustomPortions,
    setIngredientQuantity,
    applyAdjustment,
    getAdjustedIngredients,
    getAdjustmentDetails,
    canApplyAdjustment,
  };
};
