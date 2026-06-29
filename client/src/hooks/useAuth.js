import { useState, useContext, useCallback } from "react";
import { userApi } from "../api/user.api";
import { authContext } from "../context/AuthProvider";
import { userAuthStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const authData = useContext(authContext);
    const setUserStore = userAuthStore((s) => s.setUser);
    const logoutStore = userAuthStore((s) => s.logout);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const response = await userApi.loginUser({ email, password });
            if (response.success) {
                authData.login(response.data);
                setUserStore(response.data);
                toast.success(`Welcome back, ${response.data.name}!`);
                return { success: true, data: response.data };
            }
            toast.error(response.message || "Invalid credentials");
            return { success: false, message: response.message };
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            return { success: false, message: "Something went wrong" };
        } finally {
            setLoading(false);
        }
    }, [authData, setUserStore]);

    const register = useCallback(async (userData) => {
        setLoading(true);
        try {
            const response = await userApi.registerUser(userData);
            if (response.success) {
                toast.success("Account created successfully! Please check your email to verify.");
                return { success: true };
            }
            toast.error(response.message || "Registration failed");
            return { success: false, message: response.message };
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            return { success: false, message: "Something went wrong" };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await userApi.logoutUser();
        } catch (e) {
            // proceed with local logout even if API fails
        }
        authData.setUser(null);
        authData.setIsLoggedIn(false);
        logoutStore();
        toast.success("Logged out successfully");
        setLoading(false);
    }, [authData, logoutStore]);

    const user = authData.user;
    const isLoggedIn = authData.isLoggedIn;
    const isAdmin = user?.role === "admin";
    const isLoading = authData.isLoading;

    return {
        user,
        isLoggedIn,
        isAdmin,
        isLoading,
        loading,
        login,
        register,
        logout
    };
}
