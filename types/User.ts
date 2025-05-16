export interface User {
  favedRecipesIds: string[];
  _id: string;
  username: string;
  password: string;
  email: string;
  status: string;
  rol: string;
  lastRecoveryCode: string;
}
