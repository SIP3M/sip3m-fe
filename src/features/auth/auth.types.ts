export interface LoginPayload {
  identifier: string;
  password: string;
  remember_me?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  nidn: string | null;      
  fakultas: string | null;  
  roles: {                  
    id: number;
    roles: string;
  };
}

// 
export interface LoginResponse {
  message: string;
  data: {
    token: string;
    user: User;
  };
}