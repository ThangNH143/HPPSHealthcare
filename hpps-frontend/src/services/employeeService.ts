import api from "./api";

export const getEmployees = async () => {
    try {
        const response = await api.get("/employees");
        return response.data.data; // Trả về mảng dữ liệu nhân viên
    } catch (error) {
        console.error("Lỗi gọi API getEmployees:", error);
        throw error;
    }
};