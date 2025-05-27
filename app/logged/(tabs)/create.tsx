import ScreenLayout from "@/components/ScreenLayout";
import { PrimaryButton } from "@/components/Button";
import { Colors } from "@/constants/Colors";
import { useCreateRecipeViewModel, Ingredient, Step } from "@/viewmodels/CreateRecipeViewModel";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Alert,
} from "react-native";

// Componente para el primer paso (nombre)
const StepOne = ({ 
  recipeName, 
  setRecipeName, 
  onNext, 
  errors 
}: {
  recipeName: string;
  setRecipeName: (name: string) => void;
  onNext: () => void;
  errors: Record<string, string>;
}) => {
  const maxCharacters = 50;

  const clearInput = () => {
    setRecipeName("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Te llevaremos por diferentes pasos para que crees tu receta y la
          comunidad pueda verla
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.fieldLabel}>Nombre</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, errors.name && styles.textInputError]}
            value={recipeName}
            onChangeText={setRecipeName}
            placeholderTextColor={Colors.text}
            maxLength={maxCharacters}
          />
          {recipeName.length > 0 && (
            <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.text} />
            </TouchableOpacity>
          )}
        </View>

        {errors.name ? (
          <Text style={styles.errorText}>{errors.name}</Text>
        ) : (
          <Text style={styles.characterCount}>
            No puede superar los {maxCharacters} caracteres
          </Text>
        )}

        <PrimaryButton
          onPress={onNext}
          disabled={!recipeName.trim()}
          style={[
            styles.nextButton,
            !recipeName.trim() && styles.nextButtonDisabled,
          ]}
        >
          Siguiente
        </PrimaryButton>
      </View>
    </View>
  );
};

// Componente para agregar ingredientes
const IngredientForm = ({ 
  onAdd, 
  ingredients, 
  onRemove,
  onUpdate
}: {
  onAdd: (ingredient: Ingredient) => void;
  ingredients: Ingredient[];
  onRemove: (index: number) => void;
  onUpdate: (index: number, ingredient: Ingredient) => void;
}) => {
  const [showDropdowns, setShowDropdowns] = useState<{[key: string]: boolean}>({});

  const availableIngredients = [
    "Tomate", "Cebolla", "Ajo", "Zanahoria", "Papa", "Pimiento", "Apio",
    "Harina", "Azúcar", "Sal", "Pimienta", "Aceite", "Manteca", "Huevos",
    "Leche", "Queso", "Pollo", "Carne", "Pescado", "Arroz", "Fideos",
    "Pan rallado", "Perejil", "Orégano", "Laurel", "Limón", "Vinagre"
  ];

  const measureTypes = ["gramos", "cucharadas", "kilogramo", "mililitros", "tazas", "unidad", "pizca"];

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
      const updatedIngredient = { ...ingredients[index] };
      updatedIngredient[field] = value;
      onUpdate(index, updatedIngredient);
    }
  };

  const updateQuantity = (index: number, quantity: string) => {
    const updatedIngredient = { ...ingredients[index] };
    updatedIngredient.quantity = Number(quantity) || 0;
    onUpdate(index, updatedIngredient);
  };

  const addNewIngredient = () => {
    onAdd({
      name: "Ingrediente",
      quantity: 1,
      measureType: "unidad",
    });
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Ingredientes</Text>
      
      {ingredients.map((ingredient, index) => (
        <View key={index} style={styles.ingredientRow}>
          <View style={styles.ingredientDropdown}>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => toggleDropdown(`ingredient-${index}`)}
            >
              <Text style={styles.dropdownText}>{ingredient.name}</Text>
              <Ionicons name="chevron-down" size={20} color={Colors.text} />
            </TouchableOpacity>
            
            {showDropdowns[`ingredient-${index}`] && (
              <View style={styles.dropdownList}>
                <ScrollView 
                  style={styles.dropdownScroll}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {availableIngredients.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.dropdownItem}
                      onPress={() => selectOption(`ingredient-${index}`, item, index, 'name')}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          <View style={styles.quantityContainer}>
            <TextInput
              style={styles.quantityInput}
              value={ingredient.quantity.toString()}
              onChangeText={(text) => updateQuantity(index, text)}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.unitDropdown}>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => toggleDropdown(`unit-${index}`)}
            >
              <Text style={styles.dropdownText}>
                {ingredient.measureType === "unidad" ? "(u) Unidad" : ingredient.measureType}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.text} />
            </TouchableOpacity>
            
            {showDropdowns[`unit-${index}`] && (
              <View style={styles.dropdownList}>
                {measureTypes.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={styles.dropdownItem}
                    onPress={() => selectOption(`unit-${index}`, unit, index, 'measureType')}
                  >
                    <Text style={styles.dropdownItemText}>{unit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.trashButton}
            onPress={() => onRemove(index)}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.red.red600} />
          </TouchableOpacity>
        </View>
      ))}

      <PrimaryButton onPress={addNewIngredient} style={styles.addIngredientButton}>
        Agregar Ingrediente
      </PrimaryButton>
    </View>
  );
};

// Componente para agregar pasos
const StepsForm = ({ 
  onAdd, 
  steps, 
  onRemove 
}: {
  onAdd: (step: Omit<Step, 'id'>) => void;
  steps: Step[];
  onRemove: (index: number) => void;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (title.trim() && description.trim()) {
      onAdd({
        title: title.trim(),
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Instrucciones</Text>
      
      <View style={styles.stepForm}>
        <TextInput
          style={styles.textInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Título del paso"
          placeholderTextColor={Colors.text}
        />
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descripción del paso"
          placeholderTextColor={Colors.text}
          multiline
          numberOfLines={3}
        />
        <PrimaryButton onPress={handleAdd} style={styles.addStepButton}>
          Agregar paso
        </PrimaryButton>
      </View>

      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepItem}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>Paso {index + 1}: {step.title}</Text>
            <TouchableOpacity onPress={() => onRemove(index)}>
              <Ionicons name="trash-outline" size={20} color={Colors.red.red600} />
            </TouchableOpacity>
          </View>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>
      ))}
    </View>
  );
};

// Componente principal
export default function CreateRecipeScreen() {
  const {
    currentStep,
    formData,
    errors,
    updateFormData,
    nextStep,
    previousStep,
    addIngredient,
    removeIngredient,
    addStep,
    removeStep,
    addPrincipalPicture,
    removePrincipalPicture,
    addCategory,
    removeCategory,
    submitRecipe,
    isLoading,
    updateIngredient,
  } = useCreateRecipeViewModel();

  const handleNext = () => {
    const success = nextStep();
    if (!success && currentStep === 2) {
      // Si estamos en el último paso, enviar la receta
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const success = await submitRecipe();
    if (success) {
      Alert.alert(
        "¡Receta creada!",
        "Tu receta ha sido publicada exitosamente",
        [{ text: "OK", onPress: () => {} }]
      );
    }
  };

  const difficulties = [
    { key: "facil", label: "Fácil" },
    { key: "media", label: "Medio" },
    { key: "dificil", label: "Difícil" },
  ];

  if (currentStep === 1) {
    return (
      <ScreenLayout alternativeHeader={{ title: "Crear receta" }}>
        <StepOne
          recipeName={formData.name}
          setRecipeName={(name) => updateFormData("name", name)}
          onNext={handleNext}
          errors={errors}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout alternativeHeader={{ title: formData.name || "Crear receta" }}>
      <ScrollView style={styles.scrollContainer}>
        {/* Descripción */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => updateFormData("description", text)}
            placeholder="Describe tu receta..."
            placeholderTextColor={Colors.text}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.characterCount}>
            No puede superar los 500 caracteres
          </Text>
        </View>

        {/* Imágenes principales */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Imágenes</Text>
          <View style={styles.imagesContainer}>
            {formData.principalPictures.map((picture, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: picture.url }} style={styles.recipeImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removePrincipalPicture(index)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity 
              style={styles.addImageButton}
              onPress={() => addPrincipalPicture()}
              disabled={isLoading}
            >
              <Ionicons name="add" size={24} color={Colors.orange.orange700} />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            La primera imagen será la principal
          </Text>
        </View>

        {/* Tiempo y Porciones */}
        <View style={styles.row}>
          <View style={[styles.sectionContainer, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Tiempo</Text>
            <TextInput
              style={styles.textInput}
              value={formData.duration === 0 ? "" : formData.duration.toString()}
              onChangeText={(text) => {
                const num = text === "" ? 0 : Number(text);
                updateFormData("duration", isNaN(num) ? 0 : num);
              }}
              placeholder=""
              placeholderTextColor={Colors.text}
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>Tiempo en minutos</Text>
          </View>
          
          <View style={[styles.sectionContainer, { flex: 1, marginLeft: 16 }]}>
            <Text style={styles.sectionTitle}>Porciones</Text>
            <TextInput
              style={styles.textInput}
              value={formData.servings === 0 ? "" : formData.servings.toString()}
              onChangeText={(text) => {
                const num = text === "" ? 0 : Number(text);
                updateFormData("servings", isNaN(num) ? 0 : num);
              }}
              placeholder=""
              placeholderTextColor={Colors.text}
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>Porciones que rinde la receta</Text>
          </View>
        </View>

        {/* Dificultad */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dificultad</Text>
          <Text style={styles.helperText}>Selecciona el nivel de dificultad de tu receta</Text>
          <View style={styles.difficultyContainer}>
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff.key}
                style={[
                  styles.difficultyButton,
                  {
                    backgroundColor: formData.difficulty === diff.key 
                      ? Colors.olive.olive600 
                      : Colors.azul.azul500,
                    opacity: formData.difficulty === diff.key ? 1 : 0.7,
                  }
                ]}
                onPress={() => updateFormData("difficulty", diff.key)}
              >
                <Text style={styles.difficultyText}>{diff.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.difficulty && (
            <Text style={styles.errorText}>{errors.difficulty}</Text>
          )}
        </View>

        {/* Categorías */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          
          <View style={styles.categoriesGrid}>
            {["Vegetariano", "Postres", "Sopa", "Desayuno", "Almuerzo", "Cena", "Snacks", "Bebidas", "Ensaladas", "Carnes", "Pescados", "Pasta", "Arroz", "Pan", "Dulces"].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryOption,
                  formData.category.includes(category) && styles.categoryOptionSelected,
                ]}
                onPress={() => {
                  if (formData.category.includes(category)) {
                    // Remover categoría si ya está seleccionada
                    const index = formData.category.indexOf(category);
                    removeCategory(index);
                  } else {
                    // Agregar categoría si no está seleccionada
                    addCategory(category);
                  }
                }}
              >
                <Text style={[
                  styles.categoryOptionText,
                  formData.category.includes(category) && styles.categoryOptionTextSelected,
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.selectedCategoriesContainer}>
            <Text style={styles.selectedCategoriesLabel}>Seleccionadas:</Text>
            <View style={styles.categoriesContainer}>
              {formData.category.map((cat, index) => (
                <View key={index} style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{cat}</Text>
                  <TouchableOpacity onPress={() => removeCategory(index)}>
                    <Ionicons name="close" size={16} color={Colors.orange.orange700} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Ingredientes */}
        <IngredientForm
          onAdd={addIngredient}
          ingredients={formData.ingredients}
          onRemove={removeIngredient}
          onUpdate={updateIngredient}
        />

        {/* Pasos */}
        <StepsForm
          onAdd={addStep}
          steps={formData.steps}
          onRemove={removeStep}
        />

        {/* Botones de navegación */}
        <View style={styles.navigationButtons}>
          <PrimaryButton
            onPress={previousStep}
            style={[styles.navButton, { backgroundColor: Colors.olive.olive600 }]}
          >
            Anterior
          </PrimaryButton>
          
          <PrimaryButton
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.navButton}
          >
            Publicar receta
          </PrimaryButton>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  instructionContainer: {
    backgroundColor: Colors.orange.orange200,
    padding: 16,
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 16,
    color: Colors.orange.orange900,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    paddingRight: 45,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text,
  },
  textInputError: {
    borderBottomColor: Colors.red.red500,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  clearButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  characterCount: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
    marginBottom: 32,
  },
  errorText: {
    fontSize: 12,
    color: Colors.red.red600,
    marginBottom: 32,
  },
  helperText: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  nextButton: {
    marginHorizontal: 20,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  imageItem: {
    position: "relative",
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.red.red500,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.orange.orange700,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  difficultyContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  difficultyButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  difficultyText: {
    color: "white",
    fontWeight: "600",
  },
  categoryForm: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.orange.orange100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  categoryText: {
    color: Colors.orange.orange700,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: Colors.orange.orange700,
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  ingredientForm: {
    gap: 8,
    marginBottom: 16,
  },
  ingredientRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    marginBottom: 12,
  },
  ingredientDropdown: {
    backgroundColor: Colors.orange.orange100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    position: "relative",
    zIndex: 1,
    flex: 3,
    height: 40,
    justifyContent: "center",
  },
  quantityContainer: {
    backgroundColor: Colors.orange.orange100,
    paddingHorizontal: 4,
    paddingVertical: 0,
    borderRadius: 8,
    width: 60,
    height: 40,
    justifyContent: "center",
  },
  unitDropdown: {
    backgroundColor: Colors.orange.orange100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flex: 2,
    height: 40,
    justifyContent: "center",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    color: Colors.text,
    fontSize: 14,
  },
  quantityInput: {
    color: Colors.text,
    fontSize: 14,
    textAlign: "center",
    textAlignVertical: "center",
    height: "100%",
    padding: 0,
  },
  removeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.red.red100,
  },
  addIngredientButton: {
    marginTop: 16,
  },
  trashButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.red.red100,
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.orange.orange100,
  },
  dropdownItemText: {
    color: Colors.text,
    fontSize: 16,
  },
  stepForm: {
    gap: 8,
    marginBottom: 16,
  },
  addStepButton: {
    marginTop: 8,
  },
  stepItem: {
    backgroundColor: Colors.orange.orange50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.orange.orange700,
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.text,
  },
  navigationButtons: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  navButton: {
    flex: 1,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.orange.orange100,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.orange.orange200,
  },
  categoryOptionText: {
    color: Colors.text,
  },
  categoryOptionTextSelected: {
    fontWeight: "600",
  },
  selectedCategoriesContainer: {
    marginTop: 16,
  },
  selectedCategoriesLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  dropdownContainer: {
    backgroundColor: Colors.orange.orange100,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    position: "relative",
    zIndex: 1,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginRight: 8,
  },
});
