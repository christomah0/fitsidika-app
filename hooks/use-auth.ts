import { getUserByIdOrEmail } from '@/services/firebase/firestoreServices';
import { UserBase } from '@/types/user.type';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'user_session';

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Fetch/Restore session
  const { data: user, isLoading } = useQuery<UserBase | null>({
    queryKey: ['session'],
    queryFn: async () => {
      const stored = await SecureStore.getItemAsync(SESSION_KEY);
      if (!stored) return null;
      try {
        return JSON.parse(stored) as UserBase;
      } catch (e) {
        return null;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const loginMutation = useMutation<UserBase, Error, string>({
    mutationFn: async (email: string) => {
      const userData = await getUserByIdOrEmail(email);

      if (!userData) {
        throw new Error('Compte utilisateur introuvable ou inexistant.');
      }

      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(userData));
      return userData;
    },
    onSuccess: (userData) => {
      // Direct cache update
      queryClient.setQueryData(['session'], userData);
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    },
    onSuccess: () => {
      // Reset the cache and remove all other user-specific queries
      queryClient.setQueryData(['session'], null);
      queryClient.removeQueries();
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    error: loginMutation.error
  };
};
