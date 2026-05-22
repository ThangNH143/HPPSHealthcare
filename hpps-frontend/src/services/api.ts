import axios from "axios";

// Khởi tạo một instance của axios với đường dẫn mặc định tới Backend
const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;