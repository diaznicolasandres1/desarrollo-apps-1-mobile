import { Colors } from "@/constants/Colors";
import React from "react";
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
  selectedPortionType: "half" | "double" | "custom";
  customPortions: string;
  onPortionTypeSelect: (type: "half" | "double" | "custom") => void;
  onCustomPortionsChange: (value: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

const PortionsModal: React.FC<PortionsModalProps> = ({
  visible,
  originalServings,
  selectedPortionType,
  customPortions,
  onPortionTypeSelect,
  onCustomPortionsChange,
  onApply,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Alterar cantidades</Text>
          <Text style={styles.modalDescription}>
            Acá podés ajustar las cantidades de la receta según el número de
            porciones que querés preparar.
          </Text>

          <View style={styles.modalButtonsContainer}>
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
          </View>

          <View style={styles.modalCustomInputContainer}>
            <TextInput
              style={styles.modalCustomInput}
              value={customPortions}
              onChangeText={onCustomPortionsChange}
              keyboardType="numeric"
              placeholder={originalServings.toString()}
            />
          </View>

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
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
  },
  modalButtonSelected: {
    backgroundColor: Colors.olive.olive300,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1976D2",
  },
  modalButtonTextSelected: {
    color: Colors.olive.olive900,
    fontWeight: "600",
  },
  modalCustomInputContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  modalCustomInput: {
    width: 100,
    height: 50,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "white",
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
});

export default PortionsModal;
