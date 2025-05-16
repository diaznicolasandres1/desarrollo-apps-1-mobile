import { BASE_URL } from "@/constants/config";

export const recoveryPassword = async (email: string) => {
  try {
    const response = await fetch(`${BASE_URL}/users/recovery-code`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      return {
        success: false,
        recoveryCodeData: null,
        error: await response.json(),
      };
    }

    const data: {
      message: string;
      recoveryCode: string;
    } = await response.json();
    return { success: true, recoveryCodeData: data, error: null };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, recoveryCodeData: null, error: error };
  }
};

export const changePassword = async (
  email: string,
  password: string,
  recoveryCode: string
) => {
  try {
    const response = await fetch(`${BASE_URL}/users/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, newPassword: password, recoveryCode }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: await response.json(),
      };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Change password error:", error);
    return { success: false, error: error };
  }
};
