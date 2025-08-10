import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
});

export const axiosConfig = {
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
};

export default axiosClient;
