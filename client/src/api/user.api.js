import axios from "axios";

class UserApi {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/users`
    }

    registerUser = async (userData) => {
        try {
            const response = await axios.post(`${this.baseUrl}/register`, userData);
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            }
        }
    }

    loginUser = async (credentials) => {
        try {
            const response = await axios.post(`${this.baseUrl}/login`,
                credentials,
                {
                    withCredentials: true
                }
            );
            return {
                success: response.data.success,
                message: response.data.message,
                data: response.data.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            }
        }
    }

    logoutUser = async () => {
        try {
            const response = await axios.get(`${this.baseUrl}/logout`, {
                withCredentials: true
            });
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            }
        }
    }

    getAllUsers = async () => {
        try {
            const response = await axios.get(`${this.baseUrl}/all`, {
                withCredentials: true
            });
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            }
        }
    }

    authMe = async () => {
        try {
            const response = await axios.get(`${this.baseUrl}/auth-me`, {
                withCredentials: true
            })

            console.log("Auth Me Response :", response);

            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            }
        }
    }

    searchUsers = async (query) => {
        try {
            const response = await axios.get(`${this.baseUrl}/search/?query=${query}`, {
                withCredentials: true
            });
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            }
        }
    }

    updateProfile = async (profileData) => {
        try {
            const response = await axios.put(`${this.baseUrl}/update-profile`, profileData, {
                withCredentials: true
            });

            console.log("Update Profile Response :: ", response.data);

            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            }
        }
    }

    updateAvatar = async (avatarFile) => {
        try {
            const formData = new FormData();
            formData.append("newAvatar", avatarFile);
            const response = await axios.patch(`${this.baseUrl}/avatar`, formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            console.log("Update Avatar Response :: ", response.data);

            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            }
        }
    }

    getOnlineUsers = async () => {
        try {
            const response = await axios.get(`${this.baseUrl}/chat-partners`, {
                withCredentials: true
            })

            // console.log("Auth Me Response :",response);

            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            }
        }
    }

    adminGetUsers = async () => {
        try {
            const response = await axios.get(`${this.baseUrl}/admin/users`, {
                withCredentials: true
            });
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
                error: error
            };
        }
    };

    adminToggleDisableUser = async (id) => {
        try {
            const response = await axios.put(`${this.baseUrl}/admin/disable/${id}`, {}, {
                withCredentials: true
            });
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
                error: error
            };
        }
    };

    adminDeleteUser = async (id) => {
        try {
            const response = await axios.delete(`${this.baseUrl}/admin/delete/${id}`, {
                withCredentials: true
            });
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
                error: error
            };
        }
    };
}

export const userApi = new UserApi();