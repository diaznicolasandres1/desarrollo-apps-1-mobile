import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@/components/Button';
import { Colors } from '@/constants/Colors';
import { Step } from '@/viewmodels/CreateRecipeViewModel';
import { stepsFormStyles } from '../styles/ComponentStyles';

interface StepsFormProps {
  onAdd: (step: Omit<Step, 'id'>) => void;
  steps: Step[];
  onRemove: (index: number) => void;
  updateStep: (index: number, step: Step) => void;
}

const StepsForm: React.FC<StepsFormProps> = ({ 
  onAdd, 
  steps, 
  onRemove, 
  updateStep
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepImage, setStepImage] = useState<string | null>(null);

  const handleAdd = () => {
    console.log("handleAdd called", { title: title.trim(), description: description.trim() });
    if (title.trim() && description.trim()) {
      onAdd({
        title: title.trim(),
        description: description.trim(),
        ...(stepImage && { mediaResource: stepImage }),
      });
      setTitle("");
      setDescription("");
      setStepImage(null);
    } else {
      console.log("Validation failed - title or description empty");
    }
  };

  const addStepImage = async () => {
    const imageUrl = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop";
    setStepImage(imageUrl);
  };

  return (
    <View style={stepsFormStyles.sectionContainer}>
      <Text style={stepsFormStyles.sectionTitle}>Instrucciones</Text>
      
      {steps.map((step, index) => (
        <View key={step.id} style={stepsFormStyles.stepCard}>
          <View style={stepsFormStyles.stepContent}>
            <View style={stepsFormStyles.stepImageContainer}>
              {step.mediaResource ? (
                <Image source={{ uri: step.mediaResource }} style={stepsFormStyles.stepImage} />
              ) : (
                <TouchableOpacity 
                  style={stepsFormStyles.addStepImageButton}
                  onPress={() => {
                    addStepImage();
                  }}
                >
                  <Ionicons name="add" size={32} color={Colors.text} />
                </TouchableOpacity>
              )}
            </View>
            <View style={stepsFormStyles.stepTextContainer}>
              <Text style={stepsFormStyles.stepTitleDisplay}>{step.title}</Text>
              <Text style={stepsFormStyles.stepDescriptionDisplay}>{step.description}</Text>
            </View>
            <TouchableOpacity 
              style={stepsFormStyles.stepDeleteButton}
              onPress={() => onRemove(index)}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.red.red600} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={stepsFormStyles.stepForm}>
        <View style={stepsFormStyles.stepFormContainer}>
          <TextInput
            style={stepsFormStyles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Título del paso"
            placeholderTextColor={Colors.text}
          />
          <TextInput
            style={[stepsFormStyles.textInput, stepsFormStyles.textArea, stepsFormStyles.textInputNoLine]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción del paso"
            placeholderTextColor={Colors.text}
            multiline
            numberOfLines={3}
          />
          
          {/* Imagen del paso */}
          <View style={stepsFormStyles.stepImageSection}>
            <Text style={stepsFormStyles.fieldLabel}>Imagen del paso (opcional)</Text>
            {stepImage ? (
              <View style={stepsFormStyles.stepImagePreview}>
                <Image source={{ uri: stepImage }} style={stepsFormStyles.stepPreviewImage} />
                <TouchableOpacity 
                  style={stepsFormStyles.removeStepImageButton}
                  onPress={() => setStepImage(null)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={stepsFormStyles.addStepImageButtonForm}
                onPress={addStepImage}
              >
                <Ionicons name="add" size={24} color={Colors.orange.orange700} />
                <Text style={stepsFormStyles.addImageText}>Agregar imagen</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <PrimaryButton 
          onPress={handleAdd} 
          style={[stepsFormStyles.addStepButton, { backgroundColor: Colors.orange.orange400 }]}
          compact={true}
        >
          Agregar paso
        </PrimaryButton>
      </View>
    </View>
  );
};

export default StepsForm; 