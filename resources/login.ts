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

    if (!response.ok) {
      return { success: false, user: null, error: response.statusText };
    }

    const data: {
      statusCode: number;
      message: string;
      data: User;
    } = await response.json();
    return { success: true, user: data.data, error: null };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, user: null, error: error };
  }
};
