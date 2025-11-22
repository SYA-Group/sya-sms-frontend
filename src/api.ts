import axios from "axios";

const API_URL = "https://profilesms.duckdns.org:5001/api";

const api = axios.create({
  baseURL: API_URL,
});

// 🔹 Automatically attach token if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------- AUTH ----------

// Login user
export const login = async (username: string, password: string) => {
  const res = await api.post("/auth/login", { username, password });
  return res.data;
};

// Fetch logged-in user info
export const getUserInfo = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

// Register new user
export const registerUser = async (data: any) => {
  const payload = {
    ...data,
    company_type: data.company_type || "",
  };
  const res = await api.post("/auth/register", payload);
  return res.data;
};

// Change password
export const changePassword = async (
  current_password: string,
  new_password: string
) => {
  const res = await api.post("/auth/change-password", {
    current_password,
    new_password,
  });
  return res.data;
};

// Forgot password
export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

// Reset password
export const resetPassword = async (token: string, new_password: string) => {
  const res = await api.post(`/auth/reset-password/${token}`, {
    new_password,
  });
  return res.data;
};

// ---------- DASHBOARD ----------
export const getDashboardStats = async () => {
  const res = await api.get("/dashboard/stats");
  return res.data;
};

// ---------- CONTACTS ----------
export const getContacts = async () => {
  const res = await api.get("/contacts");
  return res.data;
};

export const deleteContact = async (id: number) => {
  const res = await api.delete(`/contacts/${id}`);
  return res.data;
};

export const addContact = async (data: { name: string; phone: string }) => {
  const res = await api.post("/contacts", data);
  return res.data;
};

// ---------- SMS ----------
export const sendBulkSMS = async (data: { message: string }) => {
  const res = await api.post("/sms/send", data);
  return res.data;
};

export const resendMessages = async (status: string) => {
  const res = await api.post("/sms/resend", { status });
  return res.data;
};

// ---------- UPLOAD ----------
export const uploadContacts = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/upload/contacts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

// ---------- EMAIL ----------
export const updateEmail = async (email: string) => {
  const res = await api.post("/auth/update-email", { email });
  return res.data;
};

// ---------- SUPPORT ----------
export const sendSupportMessage = async (data: { message: string }) => {
  const res = await api.post("/support/contact", data);
  return res.data;
};

// ---------- USERS ----------
export const getUsers = async () => {
  const res = await api.get("/users/list");
  return res.data;
};

export const getUser = async (id: number) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const updateUser = async (
  id: number,
  data: {
    email?: string;
    sms_quota?: number;
    is_admin?: number;
    company_type?: string;
  }
) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};

export const resetUserPassword = (id: number, newPassword: string) =>
  api.post(`/users/${id}/reset-password`, { new_password: newPassword });

export const deleteUser = async (id: number) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

export const suspendUser = (id: number, suspended: boolean) =>
  api.put(`/users/${id}/suspend`, { suspended });

// ---------- PRICING ----------
// IMPORTANT: NO TRAILING SLASH (fixes OPTIONS preflight error)
export const getPricing = async () => {
  const res = await api.get("/pricing");
  return res.data;
};

export const createPricing = async (data: any) => {
  const res = await api.post("/pricing", data);
  return res.data;
};

export const updatePricing = async (id: number, data: any) => {
  const res = await api.put(`/pricing/${id}`, data);
  return res.data;
};

export const deletePricing = async (id: number) => {
  const res = await api.delete(`/pricing/${id}`);
  return res.data;
};

// ---------- ERROR HANDLING ----------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else {
      console.error("API Error:", error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);
export const searchCount = async (
  query: string,
  governorate?: string,
  gender?: string,
  birthdate?: string,
  phone_key?: string
) => {
  const params = new URLSearchParams();
  params.set("q", query);

  if (governorate) params.set("governorate", governorate);
  if (gender) params.set("gender", gender);
  if (birthdate) params.set("birthdate", birthdate);
  if (phone_key) params.set("phone_key", phone_key); // ✔

  const res = await api.get(`/search/count?${params.toString()}`);
  return res.data;
};


// ---------- SEARCH PREVIEW ----------
export const searchPreview = async (
  query: string,
  limit: number = 20,
  governorate?: string,
  gender?: string,
  birthdate?: string,
  phone_key?: string
) => {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("limit", String(limit));

  if (governorate) params.set("governorate", governorate);
  if (gender) params.set("gender", gender);
  if (birthdate) params.set("birthdate", birthdate);
  if (phone_key) params.set("phone_key", phone_key); // ✔

  const res = await api.get(`/search/preview?${params.toString()}`);
  return res.data;
};


// ---------- SEND SEARCH SMS ----------
export const sendSearchSMS = async (data: {
  query: string;
  sms_text: string;
  limit: number;
  save_to_customers: boolean;
  governorate?: string;
  gender?: string;
  birthdate?: string;
  phone_key?: string;
}) => {
  const res = await api.post("/search/send", data);
  return res.data;
};




export default api;