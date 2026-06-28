import React from "react";
import { Navigate } from "react-router-dom";
import { userAuthStore } from "../../store/userStore.js";

function AdminRoute({ children }) {
    const { user } = userAuthStore();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "admin") {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-6">
                <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-md text-center">
                    <h1 className="text-4xl font-extrabold text-red-500 mb-4">403</h1>
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-gray-400 mb-6">
                        You do not have administrative privileges to access this area.
                    </p>
                    <a
                        href="/"
                        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition duration-300 shadow-lg hover:shadow-indigo-500/20"
                    >
                        Go back Home
                    </a>
                </div>
            </div>
        );
    }

    return children;
}

export default AdminRoute;
