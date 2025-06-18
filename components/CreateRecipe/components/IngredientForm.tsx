import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@/components/Button';
import { Colors } from '@/constants/Colors';
import { Ingredient } from '@/viewmodels/CreateRecipeViewModel';
import { ingredientFormStyles } from '../styles/ComponentStyles';

interface IngredientFormProps {
  onAdd: (ingredient: Ingredient) => void;
  ingredients: Ingredient[];
  onRemove: (index: number) => void;
  onUpdate: (index: number, ingredient: Ingredient) => void;
}

const IngredientForm: React.FC<IngredientFormProps> = ({ 
  onAdd, 
  ingredients, 
  onRemove,
  onUpdate
}) => {
  const [showDropdowns, setShowDropdowns] = useState<{[key: string]: boolean}>({});

  const availableIngredients = [
    "Tomate", "Cebolla", "Ajo", "Zanahoria", "Papa", "Pimiento", "Apio",
    "Harina", "Azúcar", "Sal", "Pimienta", "Aceite", "Manteca", "Huevos",
    "Leche", "Queso", "Pollo", "Carne", "Pescado", "Arroz", "Fideos",
    "Pan rallado", "Perejil", "Orégano", "Laurel", "Limón", "Vinagre"
  ];

  const measureTypes = ["gr", "cucharadas", "kg", "ml", "tazas", "unidad", "pizca"];

  const toggleDropdown = (key: string) => {
    setShowDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectOption = (key: string, value: string, index?: number, field?: 'name' | 'measureType') => {
    setShowDropdowns(prev => ({
      ...prev,
      [key]: false
    }));

    if (index !== undefined && field) {
      // Si no hay ingredientes reales y estamos editando el primero, agregarlo
      if (ingredients.length === 0 && index === 0) {
        const newIngredient = { name: "Ingrediente", quantity: 1, measureType: "unidad" };
        newIngredient[field] = value;
        onAdd(newIngredient);
      } else {
        const updatedIngredient = { ...ingredients[index] };
        updatedIngredient[field] = value;
        onUpdate(index, updatedIngredient);
      }
    }
  };

  const updateQuantity = (index: number, quantity: string) => {
    // Si no hay ingredientes reales y estamos editando el primero, agregarlo
    if (ingredients.length === 0 && index === 0) {
      const newIngredient = { name: "Ingrediente", quantity: Number(quantity) || 0, measureType: "unidad" };
      onAdd(newIngredient);
    } else {
      const updatedIngredient = { ...ingredients[index] };
      updatedIngredient.quantity = Number(quantity) || 0;
      onUpdate(index, updatedIngredient);
    }
  };

  const addNewIngredient = () => {
    onAdd({
      name: "Ingrediente",
      quantity: 1,
      measureType: "unidad",
    });
  };

  // Asegurar que siempre haya al menos un ingrediente para mostrar
  const displayIngredients = ingredients.length === 0 ? [{ name: "Ingrediente", quantity: 1, measureType: "unidad" }] : ingredients;

  return (
    <View style={ingredientFormStyles.sectionContainer}>
      <Text style={ingredientFormStyles.sectionTitle}>Ingredientes</Text>
      
      {displayIngredients.map((ingredient, index) => (
        <View key={index} style={ingredientFormStyles.ingredientRow}>
          <View style={ingredientFormStyles.ingredientDropdown}>
            <TouchableOpacity 
              style={ingredientFormStyles.dropdown}
              onPress={() => toggleDropdown(`ingredient-${index}`)}
            >
              <Text style={ingredientFormStyles.dropdownText}>{ingredient.name}</Text>
              <Ionicons name="chevron-down" size={20} color={Colors.text} />
            </TouchableOpacity>
            
            {showDropdowns[`ingredient-${index}`] && (
              <View style={ingredientFormStyles.dropdownList}>
                <ScrollView 
                  style={ingredientFormStyles.dropdownScroll}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {availableIngredients.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={ingredientFormStyles.dropdownItem}
                      onPress={() => selectOption(`ingredient-${index}`, item, index, 'name')}
                    >
                      <Text style={ingredientFormStyles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          <View style={ingredientFormStyles.quantityContainer}>
            <TextInput
              style={ingredientFormStyles.quantityInput}
              value={ingredient.quantity.toString()}
              onChangeText={(text) => updateQuantity(index, text)}
              keyboardType="numeric"
            />
          </View>
          
          <View style={ingredientFormStyles.unitDropdown}>
            <TouchableOpacity 
              style={ingredientFormStyles.dropdown}
              onPress={() => toggleDropdown(`unit-${index}`)}
            >
              <Text style={ingredientFormStyles.dropdownText}>
                {ingredient.measureType === "unidad" ? "(u) Unidad" : ingredient.measureType}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.text} />
            </TouchableOpacity>
            
            {showDropdowns[`unit-${index}`] && (
              <View style={ingredientFormStyles.dropdownList}>
                {measureTypes.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={ingredientFormStyles.dropdownItem}
                    onPress={() => selectOption(`unit-${index}`, unit, index, 'measureType')}
                  >
                    <Text style={ingredientFormStyles.dropdownItemText}>{unit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          {(ingredients.length > 0 || index > 0) && (
            <TouchableOpacity 
              style={ingredientFormStyles.trashButton}
              onPress={() => onRemove(index)}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.red.red600} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      <PrimaryButton 
        onPress={addNewIngredient} 
        style={[ingredientFormStyles.addIngredientButton, { backgroundColor: Colors.orange.orange700 }]}
        compact={true}
      >
        Agregar Ingrediente
      </PrimaryButton>
    </View>
  );
};

export default IngredientForm; 