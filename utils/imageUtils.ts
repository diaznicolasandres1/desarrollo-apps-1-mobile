/**
 * Utilidades para manejar imágenes en la aplicación
 */

import * as ImageManipulator from 'expo-image-manipulator';

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
 * Compresión violenta de imagen para SQLite
 * @param imageUri - URI de la imagen
 * @returns Promise con la imagen comprimida en base64
 */
export const compressImageViolently = async (imageUri: string): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: 300, // Dimensiones muy pequeñas
            height: 225, // Mantener aspect ratio 4:3
          },
        },
      ],
      {
        compress: 0.1, // Compresión violenta - 10% calidad
        format: ImageManipulator.SaveFormat.JPEG, // JPEG es más pequeño que PNG
        base64: true,
      }
    );

    // Devolver en formato data:image/jpeg;base64,... para que funcione la preview
    return `data:image/jpeg;base64,${result.base64}`;
  } catch (error) {
    console.error('Error comprimiendo imagen:', error);
    return imageUri; // Fallback a imagen original
  }
};

/**
 * Verifica si una imagen base64 es demasiado grande para almacenamiento local
 * @param base64String - String base64 de la imagen
 * @param maxSizeKB - Tamaño máximo en KB (por defecto 500KB para SQLite)
 * @returns true si es demasiado grande, false si está bien
 */
export const isImageTooLarge = (base64String: string, maxSizeKB: number = 500): boolean => {
  if (!isBase64(base64String)) {
    return false; // No es base64, no aplica
  }
  
  // Calcular tamaño aproximado en KB
  const sizeInBytes = Math.ceil((base64String.length * 3) / 4);
  const sizeInKB = sizeInBytes / 1024;
  
  return sizeInKB > maxSizeKB;
};

/**
 * Detecta el tipo de imagen
 * @param imageUrl - URL de la imagen
 * @returns tipo de imagen
 */
export const getImageType = (imageUrl: string): 'local' | 'hardcoded' | 'base64' | 'url' => {
  if (isBase64(imageUrl)) {
    return 'base64';
  }
  
  if (imageUrl.startsWith('file://')) {
    return 'local';
  }
  
  if (imageUrl.includes('assets/images/') || imageUrl.includes('example.com')) {
    return 'hardcoded';
  }
  
  return 'url';
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

    // Si es una URI local (file://), convertir a base64
    if (uri.startsWith('file://')) {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // Para URLs remotas, retornar como están (el servidor las manejará)
    return uri;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    // En caso de error, retornar la URI original
    return uri;
  }
};

/**
 * Normaliza imagen para almacenamiento (convierte local a base64)
 * @param imageUrl - URL de la imagen
 * @returns Promise con la imagen normalizada
 */
export const normalizeImageForStorage = async (imageUrl: string): Promise<string> => {
  const imageType = getImageType(imageUrl);
  
  switch (imageType) {
    case 'base64':
      return imageUrl;
    case 'local':
      const base64Image = await imageToBase64(imageUrl);
      return base64Image;
    case 'hardcoded':
      // Mantener hardcodeadas como están
      return imageUrl;
    case 'url':
      return imageUrl;
    default:
      return imageUrl;
  }
}; 