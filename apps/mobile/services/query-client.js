import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error?.status === 429) return false;
        return failureCount < 1;
      },
      gcTime: 1000 * 60 * 5,
      staleTime: 1000 * 60,
    },
    mutations: {
      retry: (failureCount, error) => {
        if (error?.status === 429) return false;
        return failureCount < 1;
      },
    },
  },
});
