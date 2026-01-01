import { useMutation } from '@tanstack/react-query';
import { registerUserService } from '../services/authServices';
import { toast } from 'react-toastify';

export const useRegisterUser = () => {
  return useMutation({
    mutationFn: (formData) => registerUserService(formData),
    mutationKey: ['register-key'],
    onSuccess: (res) => {
      toast.success('Registration successful! Please login.');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      toast.error(message);
    },
  });
};

export default useRegisterUser;