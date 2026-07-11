import axios from "axios";

export const api = axios.create({
  baseURL: 'https://192.168.0.158:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})