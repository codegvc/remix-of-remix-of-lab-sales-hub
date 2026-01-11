import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { LoginFormData, LoginResponse, AuthUser } from '@/types/auth';
import { toast } from 'sonner';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: LoginFormData): Promise<LoginResponse> => {
      const response = await api.post<LoginResponse>('/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      toast.success(`Bienvenido, ${data.user.name}`);
      navigate('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Credenciales incorrectas';
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return { logout };
};

export const getAuthUser = (): AuthUser | null => {
  const user = localStorage.getItem('auth_user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};
