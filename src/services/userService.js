import axios from "axios";

export const getUserById = async (userId) => {
  try {
    const res = await axios.get(
      `http://192.168.100.5:5000/api/users/${userId}`
    );
    return res.data.user;
  } catch (err) {
    console.error("Error fetching user:", err);
    return null;
  }
};
