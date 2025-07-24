import CommentForm from "@/components/CommentForm";
import { Colors } from "@/constants/Colors";
import { Rating, getRecipeById } from "@/resources/receipt";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { List } from "react-native-paper";

interface RatingsProps {
  ratings: Rating[];
  recipeId: string;
  isReceiptOwner: boolean;
}

// Componente para renderizar un item de rating individual
const RatingsItem = ({ rating }: { rating: Rating }) => {
  return (
    <List.Item
      title={
        <View style={styles.commentHeader}>
          <View>
            <Text style={styles.commentUser}>{rating.name}</Text>
            <Text style={styles.commentDate}>
              {new Date(rating.createdAt).toLocaleDateString("es-ES")}
            </Text>
          </View>
        </View>
      }
      description={
        <View style={styles.commentContent}>
          <Text style={styles.commentText}>{rating.comment}</Text>
          <View style={styles.commentRating}>
            {Array.from({ length: 5 }, (_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={20}
                color={i < rating.score ? Colors.orange.orange600 : "gray"}
              />
            ))}
          </View>
        </View>
      }
      style={styles.commentItem}
    />
  );
};

// Componente principal de ratings
const Ratings: React.FC<RatingsProps> = ({
  ratings,
  recipeId,
  isReceiptOwner,
}) => {
  const approvedRatings = ratings.filter(
    (rating) => rating.status === "approved"
  );

  const handleCommentAdded = async () => {
    try {
      const data = await getRecipeById(recipeId);
    } catch (error) {
      console.error("Error al recargar comentarios:", error);
    }
  };

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Comentarios</Text>
      </View>

      {approvedRatings.length === 0 && (
        <View style={styles.innerPadding}>
          <Text style={styles.noCommentsText}>
            Aún no hay comentarios para esta receta.
          </Text>
        </View>
      )}

      {approvedRatings.length > 0 && (
        <View style={styles.innerPadding}>
          <List.Section style={styles.commentList}>
            {approvedRatings.map((rating, i) => (
              <RatingsItem key={i} rating={rating} />
            ))}
          </List.Section>
        </View>
      )}

      {!isReceiptOwner && (
        <View style={styles.innerPadding}>
          <CommentForm
            recipeId={recipeId}
            onCommentAdded={handleCommentAdded}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  innerPadding: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.orange.orange100,
    padding: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.orange.orange900,
  },
  noCommentsText: {
    textAlign: "center",
    color: Colors.olive.olive600,
    fontStyle: "italic",
  },
  commentList: {
    borderRadius: 10,
    marginVertical: 0,
    gap: 10,
  },
  commentItem: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.olive.olive200,
    backgroundColor: Colors.olive.olive50,
  },
  commentHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  commentUser: {
    fontSize: 16,
    color: "gray",
    fontWeight: "bold",
  },
  commentDate: {
    fontSize: 16,
    color: Colors.olive.olive800,
  },
  commentContent: {
    flexDirection: "column",
    gap: 10,
    paddingTop: 20,
  },
  commentText: {
    fontSize: 16,
    color: Colors.olive.olive800,
  },
  commentRating: {
    flexDirection: "row",
    gap: 5,
    width: "100%",
    justifyContent: "flex-end",
  },
});

export default Ratings;
