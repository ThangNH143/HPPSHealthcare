import axios from "axios";

// Khởi tạo một instance của axios với đường dẫn mặc định tới Backend
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;