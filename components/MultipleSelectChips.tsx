import { Colors } from "@/constants/Colors";
import React, { useMemo, useRef, useState } from "react";
import {
  LayoutRectangle,
  Text as RNText,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Chip, Menu, Text, TextInput } from "react-native-paper";

type MultiSelectChipsProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onlyOne?: boolean;
  placeholder?: string;
  showSearch?: boolean;
  chipStyle?: {
    base: StyleProp<ViewStyle>;
    text: StyleProp<TextStyle>;
  };
};

const MultiSelectChips = ({
  label,
  options,
  selected,
  onChange,
  onlyOne = false,
  placeholder = "Seleccionar...",
  showSearch = true,
  chipStyle,
}: MultiSelectChipsProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [anchorLayout, setAnchorLayout] = useState<LayoutRectangle | null>(
    null
  );
  const anchorRef = useRef<View>(null);

  const filteredOptions = useMemo(
    () =>
      options.filter((opt) => opt.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );

  const isSelected = (item: string) => selected.includes(item);

  const handleToggle = (item: string) => {
    if (isSelected(item)) {
      onChange(selected.filter((i) => i !== item));
    } else {
      const next = onlyOne ? [item] : [...selected, item];
      onChange(next);
    }
    setMenuVisible(false);
  };

  const handleRemove = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const openMenu = () => {
    anchorRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setAnchorLayout({
        x: pageX,
        y: pageY + height,
        width,
        height,
      });
      setMenuVisible(true);
    });
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        ref={anchorRef}
        onPress={openMenu}
        style={styles.dropdown}
        activeOpacity={0.8}
      >
        {selected.length > 0 ? (
          <View style={styles.chipGroup}>
            {selected.map((item) => (
              <Chip
                key={item}
                onClose={() => handleRemove(item)}
                style={[styles.chip, chipStyle?.base]}
                textStyle={[styles.chipText, chipStyle?.text]}
              >
                {item}
              </Chip>
            ))}
          </View>
        ) : (
          <RNText style={styles.placeholder}>{placeholder}</RNText>
        )}
      </TouchableOpacity>

      {anchorLayout && (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={{ x: anchorLayout.x, y: anchorLayout.y }}
          style={[styles.menu, { width: anchorLayout.width }]}
        >
          {showSearch && (
            <TextInput
              placeholder="Buscar..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              mode="flat"
            />
          )}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <Menu.Item
                key={opt}
                onPress={() => handleToggle(opt)}
                title={opt}
                disabled={onlyOne ? selected.length >= 1 : isSelected(opt)}
                titleStyle={styles.menuItemTitle}
              />
            ))
          ) : (
            <Text style={styles.noResults}>No hay resultados</Text>
          )}
        </Menu>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  dropdown: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderColor: "#ccc",
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  placeholder: {
    color: "#888",
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.olive.olive200,
    marginRight: 6,
  },
  chipText: {
    color: Colors.olive.olive700,
    fontWeight: "bold",
  },
  menu: {
    elevation: 4,
  },
  searchInput: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  noResults: {
    textAlign: "center",
    paddingVertical: 20,
    color: "#666",
  },
});

export default MultiSelectChips;
