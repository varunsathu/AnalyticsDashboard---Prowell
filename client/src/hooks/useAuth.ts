import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

const isDev = import.meta.env.MODE === "development";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    enabled: !isDev, // Don't run the query in development
  });

  if (isDev) {
    return {
      user: { name: "Dev User" },
      isLoading: false,
      isAuthenticated: true,
    };
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}