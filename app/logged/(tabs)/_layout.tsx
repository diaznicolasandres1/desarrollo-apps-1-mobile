import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth.context";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";

// Componente para tab deshabilitado en modo invitado
function DisabledGuestTabButton(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      style={[props.style, { opacity: 0.5 }]}
      onPress={(ev) => {
        ev.preventDefault();
      }}
      onPressIn={(ev) => {
        ev.preventDefault();
      }}
    />
  );
}

export default function TabLayout() {
  const { isGuest } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
        tabBarInactiveTintColor: Colors.olive.olive900,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {
            backgroundColor: Colors.orange.orange50,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="menu-outline" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Crear",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle-outline" size={28} color={color} />
          ),
          tabBarButton: isGuest ? DisabledGuestTabButton : undefined,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={28} color={color} />
          ),
          tabBarButton: isGuest ? DisabledGuestTabButton : undefined,
        }}
      />
      <Tabs.Screen
        name="my-recipes"
        options={{
          title: "Mis recetas",
          tabBarIcon: ({ color }) => (
            <Ionicons name="restaurant-outline" size={28} color={color} />
          ),
          tabBarButton: isGuest ? DisabledGuestTabButton : undefined,
        }}
      />
    </Tabs>
  );
}
