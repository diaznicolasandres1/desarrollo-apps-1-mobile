import * as ImagePicker from 'expo-image-picker';

export const useImagePicker = () => {
  const pickImage = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos para acceder a la galería');
        return null;
      }

      // Abrir selector de imágenes con configuración ultra-compacta
              const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7, // Calidad mejorada ahora que el backend acepta 10MB
          base64: false,
          allowsMultipleSelection: false,
        });

      if (!result.canceled && result.assets[0]) {
        console.log("📸 Imagen seleccionada:", {
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          fileSize: result.assets[0].fileSize,
        });
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  };

  return { pickImage };
}; 