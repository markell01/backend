import { api } from "./api"

type LoginDto= {
  username: string,
  password: string
}

export const authService = {
  login(data: LoginDto) {
    return api.post('/auth/login', data);
  },

  register(data: LoginDto) {
    return api.post('/auth/registration', data);
  },

  logout() {
    return api.post('/auth/logout');
  },

  me() {
    return api.get('/me');
  }
}