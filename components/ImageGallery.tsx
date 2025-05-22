import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  images: string[];
};

export const ImageGallery = ({ images }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);

  if (!images || images.length === 0) return null;

  const mainImage = images[0];
  const thumbnails = images.length > 1 ? images.slice(1, 2) : [];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.showAllBtn}
      >
        <Text style={styles.showAllText}>Ver todas</Text>
      </TouchableOpacity>

      <View style={styles.gallery}>
        <Image source={{ uri: mainImage }} style={styles.mainImage} />

        <View style={styles.thumbnailColumn}>
          {thumbnails.map((thumb, i) => (
            <Image key={i} source={{ uri: thumb }} style={styles.thumbnail} />
          ))}
        </View>
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Ver todas</Text>
          <ScrollView contentContainerStyle={styles.modalGrid}>
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.modalImage} />
            ))}
          </ScrollView>
          <Pressable
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  showAllBtn: {
    alignSelf: "flex-end",
    marginBottom: 6,
  },
  showAllText: {
    color: Colors.azul.azul700,
    fontWeight: "bold",
    marginRight: 10,
  },
  gallery: {
    flexDirection: "row",
  },
  mainImage: {
    flex: 1,
    height: 200,
    borderRadius: 30,
  },
  thumbnailColumn: {
    marginLeft: 10,
    justifyContent: "space-between",
  },
  thumbnail: {
    width: 60,
    height: 200,
    borderRadius: 50,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 10,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  modalImage: {
    width: Dimensions.get("window").width / 2 - 20,
    height: 180,
    margin: 10,
    borderRadius: 12,
  },
  closeButton: {
    margin: 20,
    padding: 12,
    backgroundColor: "#3483FA",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
