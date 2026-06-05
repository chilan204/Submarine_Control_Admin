export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  roleCode: string;
}

export interface UserFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  roleCode: string;
  password?: string;
}
