import { ModifiedIngredients, PortionsType } from "@/app/logged/receipt/[id]";
import { Colors } from "@/constants/Colors";
import { Ingredient } from "@/resources/receipt";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PortionsModalProps {
  visible: boolean;
  originalServings: number;
  selectedPortionType: PortionsType;
  customPortions: string;
  ingredients: Ingredient[];
  modifiedIngredients: ModifiedIngredients;
  onPortionTypeSelect: (type: PortionsType) => void;
  onCustomPortionsChange: (value: string) => void;
  onIngredientQuantityChange: (ingredientId: string, quantity: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

const PortionsModal: React.FC<PortionsModalProps> = ({
  visible,
  originalServings,
  selectedPortionType,
  customPortions,
  ingredients,
  modifiedIngredients,
  onPortionTypeSelect,
  onCustomPortionsChange,
  onIngredientQuantityChange,
  onApply,
  onCancel,
}) => {
  const [selectedIngredientIndex, setSelectedIngredientIndex] =
    useState<number>(0);

  React.useEffect(() => {
    if (!visible || selectedPortionType !== "ingredients") {
      setSelectedIngredientIndex(0);
    }
  }, [visible, selectedPortionType]);

  // Ensure selectedIngredientIndex is valid
  const validSelectedIndex = Math.min(
    selectedIngredientIndex,
    (ingredients?.length || 1) - 1
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedPortionType === "ingredients"
              ? "Personalizar ingredientes"
              : "Alterar cantidades"}
          </Text>
          <Text style={styles.modalDescription}>
            {selectedPortionType === "ingredients"
              ? "Al modificar un ingrediente, todos los demás se ajustarán automáticamente de forma proporcional."
              : selectedPortionType === "original"
                ? "Esto restablecerá todas las cantidades a los valores originales de la receta."
                : "Acá podés ajustar las cantidades de la receta según el número de porciones que querés preparar."}
          </Text>

          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                selectedPortionType === "original" &&
                  styles.modalButtonSelected,
              ]}
              onPress={() => onPortionTypeSelect("original")}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  selectedPortionType === "original" &&
                    styles.modalButtonTextSelected,
                ]}
              >
                Original
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                selectedPortionType === "half" && styles.modalButtonSelected,
              ]}
              onPress={() => onPortionTypeSelect("half")}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  selectedPortionType === "half" &&
                    styles.modalButtonTextSelected,
                ]}
              >
                La mitad
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                selectedPortionType === "double" && styles.modalButtonSelected,
              ]}
              onPress={() => onPortionTypeSelect("double")}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  selectedPortionType === "double" &&
                    styles.modalButtonTextSelected,
                ]}
              >
                El doble
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                selectedPortionType === "custom" && styles.modalButtonSelected,
              ]}
              onPress={() => onPortionTypeSelect("custom")}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  selectedPortionType === "custom" &&
                    styles.modalButtonTextSelected,
                ]}
              >
                Customizado
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.modalButtonWide,
                selectedPortionType === "ingredients" &&
                  styles.modalButtonSelected,
              ]}
              onPress={() => onPortionTypeSelect("ingredients")}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  selectedPortionType === "ingredients" &&
                    styles.modalButtonTextSelected,
                ]}
              >
                Por Ingredientes
              </Text>
            </TouchableOpacity>
          </View>

          {selectedPortionType === "ingredients" ? (
            <View style={styles.modalCustomInputContainer}>
              <Text style={styles.modalDescription}>
                Selecciona un ingrediente para modificar su cantidad:
              </Text>

              {/* Grid para seleccionar ingrediente */}
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Ingrediente:</Text>
                <View style={styles.ingredientGrid}>
                  {ingredients.map((ingredient, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.ingredientChip,
                        selectedIngredientIndex === index &&
                          styles.ingredientChipSelected,
                        modifiedIngredients[index.toString()] &&
                          styles.ingredientChipModified,
                      ]}
                      onPress={() => setSelectedIngredientIndex(index)}
                    >
                      <Text
                        style={[
                          styles.ingredientChipText,
                          selectedIngredientIndex === index &&
                            styles.ingredientChipTextSelected,
                        ]}
                      >
                        {ingredient.name}
                      </Text>

                      {modifiedIngredients[index.toString()] && (
                        <Text style={styles.modifiedBadge}>●</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Editor para el ingrediente seleccionado */}
              {ingredients[validSelectedIndex] && (
                <View style={styles.selectedIngredientEditor}>
                  <Text style={styles.selectedIngredientName}>
                    {ingredients[validSelectedIndex].name}
                  </Text>
                  <View style={styles.inputWithUnit}>
                    <TextInput
                      style={styles.selectedIngredientInput}
                      value={
                        modifiedIngredients[validSelectedIndex.toString()]
                          ?.quantity ||
                        ingredients[validSelectedIndex].quantity.toString()
                      }
                      onChangeText={(value) => {
                        onIngredientQuantityChange(
                          validSelectedIndex.toString(),
                          value
                        );
                      }}
                      placeholder={ingredients[
                        validSelectedIndex
                      ].quantity.toString()}
                      keyboardType="numeric"
                    />
                    <Text style={styles.unitLabel}>
                      {ingredients[validSelectedIndex].measureType ||
                        "unidad(es)"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.modalCustomInputContainer}>
              <View style={styles.portionsInputContainer}>
                <TextInput
                  style={styles.modalCustomInput}
                  value={customPortions}
                  onChangeText={onCustomPortionsChange}
                  keyboardType="numeric"
                  placeholder={originalServings.toString()}
                />
                <Text style={styles.unitLabel}>porciones</Text>
              </View>
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={onCancel}
            >
              <Text style={styles.modalActionButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={onApply}
            >
              <Text style={styles.modalActionButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: Colors.olive.olive50,
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    color: "black",
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 20,
    color: Colors.gray.gray600,
    lineHeight: 20,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButton: {
    width: "48%",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonWide: {
    width: "100%",
    paddingVertical: 16,
  },
  modalButtonSelected: {
    backgroundColor: Colors.olive.olive300,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1976D2",
  },
  modalButtonSubtext: {
    fontSize: 11,
    color: "#1976D2",
    marginTop: 2,
    fontStyle: "italic",
  },
  modalButtonTextSelected: {
    color: Colors.olive.olive900,
    fontWeight: "600",
  },
  modalCustomInputContainer: {
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: Colors.olive.olive50,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.olive.olive100,
  },
  modalCustomInput: {
    width: 80,
    height: 45,
    borderColor: Colors.olive.olive400,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "white",
    fontWeight: "600",
    color: Colors.olive.olive900,
    shadowColor: Colors.olive.olive300,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalActionButton: {
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.olive.olive900,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  ingredientRowEditing: {
    backgroundColor: Colors.olive.olive100,
    borderWidth: 1,
    borderColor: Colors.olive.olive300,
  },
  ingredientName: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray.gray700,
    marginRight: 10,
  },
  ingredientNameEditing: {
    color: Colors.olive.olive900,
    fontWeight: "600",
  },
  ingredientInput: {
    width: 80,
    height: 40,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "white",
  },
  ingredientInputActive: {
    borderColor: Colors.olive.olive500,
    borderWidth: 2,
    backgroundColor: "white",
    shadowColor: Colors.olive.olive300,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ingredientsScrollView: {
    maxHeight: 200,
    width: "100%",
  },
  ingredientEditContainer: {
    alignItems: "center",
  },
  ingredientValueButton: {
    width: 80,
    height: 40,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  ingredientValueButtonModified: {
    backgroundColor: Colors.olive.olive200,
    borderColor: Colors.olive.olive400,
    borderWidth: 1.5,
  },
  ingredientValueText: {
    fontSize: 14,
    textAlign: "center",
    color: Colors.gray.gray700,
    marginRight: 4,
  },
  ingredientValueTextModified: {
    color: Colors.olive.olive800,
    fontWeight: "600",
  },
  tapHint: {
    fontSize: 10,
    color: Colors.gray.gray500,
  },
  dropdownContainer: {
    width: "100%",
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray.gray700,
    marginBottom: 8,
    textAlign: "center",
  },
  ingredientSelector: {
    maxHeight: 50,
  },
  ingredientSelectorContent: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  ingredientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  ingredientChip: {
    width: "22%",
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ingredientChipSelected: {
    backgroundColor: Colors.olive.olive300,
    borderColor: Colors.olive.olive500,
    borderWidth: 2,
  },
  ingredientChipModified: {
    backgroundColor: Colors.olive.olive200,
    borderColor: Colors.olive.olive400,
  },
  ingredientChipText: {
    fontSize: 11,
    color: Colors.gray.gray700,
    textAlign: "center",
    flexShrink: 1,
    fontWeight: "600",
  },
  ingredientChipUnit: {
    fontSize: 9,
    color: Colors.gray.gray500,
    textAlign: "center",
    marginTop: 2,
    fontStyle: "italic",
  },
  ingredientChipTextSelected: {
    color: Colors.olive.olive900,
    fontWeight: "600",
  },
  modifiedBadge: {
    fontSize: 6,
    color: Colors.olive.olive600,
    marginLeft: 2,
    position: "absolute",
    top: 2,
    right: 2,
  },
  selectedIngredientEditor: {
    width: "100%",
    backgroundColor: Colors.olive.olive50,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.olive.olive200,
    alignItems: "center",
  },
  selectedIngredientName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.olive.olive900,
    marginBottom: 10,
    textAlign: "center",
  },
  selectedIngredientInput: {
    width: 120,
    height: 50,
    borderColor: Colors.olive.olive400,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "white",
    shadowColor: Colors.olive.olive300,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  unitLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.olive.olive700,
    backgroundColor: Colors.olive.olive100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.olive.olive300,
  },
  portionsInputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.olive.olive50,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: Colors.olive.olive200,
    shadowColor: Colors.olive.olive300,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  proportionalIndicator: {
    width: "100%",
    backgroundColor: Colors.olive.olive200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.olive.olive400,
  },
  proportionalIndicatorText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.olive.olive800,
    textAlign: "center",
  },
  autoRecalculateIndicator: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.orange.orange50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.orange.orange200,
  },
  autoRecalculateText: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.orange.orange600,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default PortionsModal;
