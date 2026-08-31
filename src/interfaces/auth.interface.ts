

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Auth {
  accessToken: string;
  user: User;
}

export interface Register {
  name: string;
  email: string;
  password?: string;
}

export interface Login {
  email: string;
  password?: string;
}

export interface ChangePassword {
  currentPassword?: string;
  newPassword?: string;
}
