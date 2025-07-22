import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 60 seconds
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default queryClient;
