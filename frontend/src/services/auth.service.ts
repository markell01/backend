import { instance } from "./instance";

type LoginDto = {
  username: string;
  password: string;
};

export const authService = {
  login(data: LoginDto) {
    return instance.post("/auth/login", data);
  },

  register(data: LoginDto) {
    return instance.post("/auth/registration", data);
  },

  logout() {
    return instance.post("/auth/logout");
  },

  me() {
    return instance.get("/auth/me");
  },
};
