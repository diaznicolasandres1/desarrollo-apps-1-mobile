import { BASE_URL } from "@/constants/config";
import { User } from "@/types/User";

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/users/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const responseData = await response.json();

    if (response.status === 201) {
      return { 
        success: true, 
        user: responseData.data, 
        error: null 
      };
    }

    return { 
      success: false, 
      user: null, 
      error: responseData.message 
    };
    
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, user: null, error: "Error de conexión" };
  }
};
