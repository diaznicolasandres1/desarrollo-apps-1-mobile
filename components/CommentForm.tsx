import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { addRating } from "@/resources/receipt";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface CommentFormProps {
  recipeId: string;
  onCommentAdded?: () => void;
}

const CommentForm = ({ recipeId, onCommentAdded }: CommentFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleStarPress = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Por favor selecciona una calificación",
      });
      return;
    }

    if (comment.trim().length === 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Por favor escribe un comentario",
      });
      return;
    }

    if (!user) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debes estar logueado para enviar un comentario",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData = {
        userId: user._id,
        name: user.username,
        score: rating,
        comment: comment.trim(),
      };

      const success = await addRating(recipeId, ratingData);

      if (success) {
        Toast.show({
          type: "success",
          text1: "!Listo¡",
          text2: "Tu comentario ha sido enviado.",
        });

        // Limpiar formulario y llamar callback
        setRating(0);
        setComment("");
        if (onCommentAdded) {
          onCommentAdded();
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se pudo enviar el comentario. Inténtalo de nuevo.",
        });
      }
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo enviar el comentario. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.commentFormContainer}>
      <Text style={styles.commentFormTitle}>Dejá tu comentario:</Text>

      <View style={styles.starsContainer}>
        {Array.from({ length: 5 }, (_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleStarPress(i)}
            disabled={isSubmitting}
          >
            <Ionicons
              name="star"
              size={40}
              color={i < rating ? Colors.orange.orange600 : Colors.gray.gray300}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.commentInput}
        placeholder="Dejá tu comentario"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        maxLength={500}
        editable={!isSubmitting}
        textAlignVertical="top"
      />

      <Text style={styles.characterCounter}>{comment.length}/500</Text>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (rating === 0 || comment.trim().length === 0 || isSubmitting) &&
            styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={rating === 0 || comment.trim().length === 0 || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Aplicar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  commentFormContainer: {
    backgroundColor: Colors.orange.orange50,
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.orange.orange200,
    marginTop: 20,
  },
  commentFormTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.orange.orange900,
    marginBottom: 15,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  commentInput: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.orange.orange300,
    padding: 15,
    fontSize: 16,
    color: Colors.olive.olive800,
    minHeight: 100,
    marginBottom: 10,
  },
  characterCounter: {
    textAlign: "right",
    color: Colors.gray.gray600,
    fontSize: 12,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: Colors.orange.orange600,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray.gray400,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CommentForm;
