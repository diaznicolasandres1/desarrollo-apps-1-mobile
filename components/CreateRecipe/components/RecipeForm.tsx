import { PrimaryButton } from "@/components/Button";
import { Colors } from "@/constants/Colors";
import { categories, difficulties } from "@/constants/config";
import { getImageUri } from "@/utils/imageUtils";
import { useCreateRecipeViewModel } from "@/viewmodels/CreateRecipeViewModel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { recipeFormStyles } from "../styles/ComponentStyles";
import IngredientForm from "./IngredientForm";
import StepsForm from "./StepsForm";

interface RecipeFormProps {
  viewModel: ReturnType<typeof useCreateRecipeViewModel>;
  onSubmit: () => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ viewModel, onSubmit }) => {
  const {
    formData,
    updateFormData,
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
    isLoading,
  } = viewModel;

  return (
    <>
      {/* Nombre de la receta en recuadro naranja */}
      {formData.name && (
        <View style={recipeFormStyles.recipeNameContainer}>
          <Text style={recipeFormStyles.recipeNameText}>{formData.name}</Text>
        </View>
      )}

      <ScrollView style={recipeFormStyles.scrollContainer}>
        {/* Descripción */}
        <View style={recipeFormStyles.sectionContainer}>
          <Text style={recipeFormStyles.sectionTitle}>Descripción</Text>
          <TextInput
            style={[
              recipeFormStyles.textInput,
              recipeFormStyles.textArea,
              recipeFormStyles.textInputNoLine,
            ]}
            value={formData.description}
            onChangeText={(text) => updateFormData("description", text)}
            placeholder="Describe tu receta..."
            placeholderTextColor={Colors.text}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={recipeFormStyles.characterCount}>
            No puede superar los 500 caracteres
          </Text>
        </View>

        {/* Imágenes principales */}
        <View style={recipeFormStyles.sectionContainer}>
          <Text style={recipeFormStyles.sectionTitle}>Imágenes</Text>
          <View style={recipeFormStyles.imagesSectionContainer}>
            {formData.principalPictures.map((picture, index) => (
              <View key={index} style={recipeFormStyles.imageItem}>
                <Image
                  source={getImageUri(picture.url)}
                  style={recipeFormStyles.recipeImage}
                />
                <TouchableOpacity
                  style={recipeFormStyles.removeImageButton}
                  onPress={() => removePrincipalPicture(index)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={recipeFormStyles.addImageButtonContainer}
              onPress={() => addPrincipalPicture()}
              disabled={isLoading}
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={Colors.olive.olive700}
              />
            </TouchableOpacity>
          </View>
          <Text style={recipeFormStyles.helperTextImages}>
            La primera imagen será la principal
          </Text>
        </View>

        {/* Tiempo y Porciones */}
        <View style={recipeFormStyles.row}>
          <View style={[recipeFormStyles.sectionContainer, { flex: 1 }]}>
            <Text style={recipeFormStyles.sectionTitle}>Tiempo</Text>
            <View style={recipeFormStyles.numericRow}>
              <TextInput
                style={recipeFormStyles.numericInput}
                value={
                  formData.duration === 0 ? "" : formData.duration.toString()
                }
                onChangeText={(text) => {
                  const num = text === "" ? 0 : Number(text);
                  updateFormData("duration", isNaN(num) ? 0 : num);
                }}
                placeholder=""
                placeholderTextColor={Colors.text}
                keyboardType="numeric"
              />
              <Text style={recipeFormStyles.numericLabel}>Minutos</Text>
            </View>
            <Text style={recipeFormStyles.helperText}>Tiempo en minutos</Text>
          </View>

          <View
            style={[
              recipeFormStyles.sectionContainer,
              { flex: 1, marginLeft: 16 },
            ]}
          >
            <Text style={recipeFormStyles.sectionTitle}>Porciones</Text>
            <View style={recipeFormStyles.numericRow}>
              <TextInput
                style={recipeFormStyles.numericInput}
                value={
                  formData.servings === 0 ? "" : formData.servings.toString()
                }
                onChangeText={(text) => {
                  const num = text === "" ? 0 : Number(text);
                  updateFormData("servings", isNaN(num) ? 0 : num);
                }}
                placeholder=""
                placeholderTextColor={Colors.text}
                keyboardType="numeric"
              />
              <Text style={recipeFormStyles.numericLabel}>porciones</Text>
            </View>
            <Text style={recipeFormStyles.helperText}>
              Porciones que rinde la receta
            </Text>
          </View>
        </View>

        {/* Dificultad */}
        <View style={recipeFormStyles.sectionContainer}>
          <Text style={recipeFormStyles.sectionTitle}>Dificultad</Text>
          <View style={recipeFormStyles.difficultyContainer}>
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff.key}
                style={[
                  recipeFormStyles.difficultyButton,
                  {
                    backgroundColor:
                      formData.difficulty === diff.key
                        ? Colors.olive.olive200
                        : Colors.azul.azul50,
                  },
                ]}
                onPress={() => updateFormData("difficulty", diff.key)}
              >
                <Text
                  style={[
                    recipeFormStyles.difficultyText,
                    {
                      color:
                        formData.difficulty === diff.key
                          ? Colors.olive.olive700
                          : Colors.azul.azul300,
                    },
                  ]}
                >
                  {diff.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categorías */}
        <View style={recipeFormStyles.sectionContainer}>
          <Text style={recipeFormStyles.sectionTitle}>Categorías</Text>

          <View style={recipeFormStyles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  recipeFormStyles.categoryOption,
                  formData.category.includes(category) &&
                    recipeFormStyles.categoryOptionSelected,
                ]}
                onPress={() => {
                  if (formData.category.includes(category)) {
                    const index = formData.category.indexOf(category);
                    removeCategory(index);
                  } else {
                    addCategory(category);
                  }
                }}
              >
                <Text
                  style={[
                    recipeFormStyles.categoryOptionText,
                    formData.category.includes(category) &&
                      recipeFormStyles.categoryOptionTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={recipeFormStyles.selectedCategoriesContainer}>
            <Text style={recipeFormStyles.selectedCategoriesLabel}>
              Seleccionadas:
            </Text>
            <View style={recipeFormStyles.categoriesContainer}>
              {formData.category.map((cat, index) => (
                <View key={index} style={recipeFormStyles.categoryChip}>
                  <Text style={recipeFormStyles.categoryText}>{cat}</Text>
                  <TouchableOpacity onPress={() => removeCategory(index)}>
                    <Ionicons
                      name="close"
                      size={16}
                      color={Colors.orange.orange700}
                    />
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
          updateStep={updateStep}
        />

        {/* Mostrar errores de envío */}
        {viewModel.errors.submit && (
          <View style={recipeFormStyles.errorContainer}>
            <Text style={recipeFormStyles.errorText}>
              {viewModel.errors.submit}
            </Text>
          </View>
        )}

        {/* Botones de navegación */}
        <View style={recipeFormStyles.navigationButtons}>
          <PrimaryButton
            onPress={onSubmit}
            loading={isLoading}
            style={recipeFormStyles.publishButton}
          >
            Publicar receta
          </PrimaryButton>
        </View>
      </ScrollView>
    </>
  );
};

export default RecipeForm;
