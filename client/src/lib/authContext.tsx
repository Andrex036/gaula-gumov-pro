import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

export type Role = "Administrador" | "Funcionario" | null;

interface User {
    id: string;
    username: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    role: Role;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => Promise<User>;
    register: (data: any) => Promise<User>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: user, isLoading, error } = useQuery<User>({
        queryKey: ["/api/user"],
        retry: false,
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: any) => {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
            if (!res.ok) {
                throw new Error((await res.json()).message || "Error de autenticación");
            }
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["/api/user"], data);
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (userData: any) => {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });
            if (!res.ok) {
                throw new Error((await res.json()).message || "Error al registrar");
            }
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["/api/user"], data);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/logout", { method: "POST" });
            if (!res.ok) throw new Error("Logout failed");
        },
        onSuccess: () => {
            queryClient.setQueryData(["/api/user"], null);
        },
    });

    return (
        <AuthContext.Provider value={{
            user: user || null,
            role: user?.role || null,
            isAuthenticated: Boolean(user && !error),
            isLoading,
            login: loginMutation.mutateAsync,
            register: registerMutation.mutateAsync,
            logout: () => logoutMutation.mutate()
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
