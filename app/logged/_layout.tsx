import { useAuth } from "@/context/auth.context";
import { Redirect, Slot } from "expo-router";
import React from "react";

const Layout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(unauth)" />;
  }

  return <Slot />;
};

export default Layout;
