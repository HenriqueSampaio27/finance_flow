import { apiRequest } from "./apiRequest";
import { UserType } from "../types/userType";

interface UserResponse {
  message: string;
  user: UserType;
}

export async function getUser(): Promise<UserType> {
  return apiRequest<UserType>("/user");
}

export async function updateUser(
  id: number,
  user: Omit<UserType, "id">
): Promise<UserResponse> {
  return apiRequest<UserResponse>(
    `/user/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(user),
    }
  );
}