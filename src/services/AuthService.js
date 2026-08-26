import axios from "axios";

export const baseUrl =
  "http://localhost:5000";

export const login = async (
  username,
  password
) => {
  const response =
    await axios.post(
      `${baseUrl}/dashboard`,
      {
        username,
        password,
      }
    );

  const data = response.data;

  return data;
};