import axios from "axios";

export const instance = axios.create({
  baseURL: "http://192.168.0.158:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let openModalTrigger: (() => void) | null = null;

export const registerModalTrigger = (trigger: () => void) => {
  openModalTrigger = trigger;
};

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (openModalTrigger) {
        openModalTrigger();
      }
    }
    return Promise.reject(error);
  },
);
