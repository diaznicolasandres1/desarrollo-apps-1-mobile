/**
 * Utilidades para manejar imágenes en la aplicación
 */

/**
 * Detecta si una cadena es base64
 * @param str - La cadena a verificar
 * @returns true si es base64, false si no
 */
export const isBase64 = (str: string): boolean => {
  try {
    // Verificar si comienza con data:image
    if (str.startsWith('data:image/')) {
      return true;
    }
    
    // Verificar si es una cadena base64 válida (sin data:image)
    if (str.length > 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(str)) {
      // Intentar decodificar para verificar que es válido
      atob(str);
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
};

/**
 * Obtiene la URI correcta para una imagen
 * @param imageUrl - URL de la imagen o base64
 * @returns Objeto con uri para Image component
 */
export const getImageUri = (imageUrl: string) => {
  if (isBase64(imageUrl)) {
    // Si es base64, usar directamente
    return { uri: imageUrl };
  } else {
    // Si es URL externa, usar como está
    return { uri: imageUrl };
  }
};

/**
 * Obtiene la URI de la primera imagen de un array de principalPictures
 * @param principalPictures - Array de imágenes principales
 * @param fallbackUrl - URL de fallback si no hay imágenes
 * @returns Objeto con uri para Image component
 */
export const getFirstImageUri = (
  principalPictures: Array<{ url: string; description: string }>,
  fallbackUrl: string = "https://via.placeholder.com/120x120.png?text=Sin+imagen"
) => {
  if (principalPictures && principalPictures.length > 0) {
    return getImageUri(principalPictures[0].url);
  }
  return { uri: fallbackUrl };
};

/**
 * Convierte una imagen a base64
 * @param uri - URI de la imagen (puede ser local o remota)
 * @returns Promise con el base64 de la imagen
 */
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    // Si ya es base64, retornarlo directamente
    if (isBase64(uri)) {
      return uri;
    }

    // Para imágenes locales o remotas, necesitaríamos implementar la conversión
    // Por ahora, retornamos la URI original
    // TODO: Implementar conversión real de imagen a base64
    return uri;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}; 