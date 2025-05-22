import ScreenLayout from "@/components/ScreenLayout";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";

import { PrimaryButton } from "@/components/Button";
import MultiSelectChips from "@/components/MultipleSelectChips";
import { Colors } from "@/constants/Colors";

type SearchForm = {
  search: string;
  includeIngredients: string[];
  excludeIngredients: string[];
  category: string;
  user: string;
};

const ingredientOptions = ["Harina", "Nuez Moscada", "Sal", "Azucar", "Huevos"];
const excludeOptions = ["Sal", "Azucar", "Huevos"];
const categories = ["Vegetariano", "Vegano", "Carnivoro", "Pescetariano"];
const users = ["Tomás Schuster", "Juan Perez", "Maria Gonzalez"];

const Search = () => {
  const { control, handleSubmit, setValue, watch } = useForm<SearchForm>({
    defaultValues: {
      search: "",
      includeIngredients: [],
      excludeIngredients: [],
      category: "",
      user: "",
    },
  });

  const { search, includeIngredients, excludeIngredients, category, user } =
    watch();

  return (
    <ScreenLayout alternativeHeader={{ title: "Buscá tus recetas" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Controller
          name="search"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Buscar"
              placeholder="Salsa blanca"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              style={styles.input}
              right={
                value ? (
                  <TextInput.Icon icon="close" onPress={() => onChange("")} />
                ) : null
              }
            />
          )}
        />

        <MultiSelectChips
          label="Incluir ingredientes"
          options={ingredientOptions}
          selected={includeIngredients}
          onChange={(value) => setValue("includeIngredients", value)}
        />

        <MultiSelectChips
          label="Excluir ingredientes"
          options={excludeOptions}
          selected={excludeIngredients}
          onChange={(value) => setValue("excludeIngredients", value)}
        />

        <MultiSelectChips
          label="Categoría"
          options={categories}
          selected={category ? [category] : []}
          onChange={(value) => setValue("category", value[0])}
          onlyOne={true}
        />

        <MultiSelectChips
          label="Usuario"
          options={users}
          selected={user ? [user] : []}
          onChange={(value) => setValue("user", value[0])}
          onlyOne={true}
          chipStyle={{
            base: { backgroundColor: Colors.azul.azul100 },
            text: { color: Colors.azul.azul900 },
          }}
        />

        <View style={styles.buttonContainer}>
          <PrimaryButton
            mode="contained"
            onPress={handleSubmit((data) => console.log(data))}
            style={{ minWidth: 200, minHeight: 40 }}
          >
            Buscar
          </PrimaryButton>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: "#E7F3E7",
  },
  dropdown: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});

export default Search;
