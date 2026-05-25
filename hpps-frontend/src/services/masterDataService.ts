import api from "./api";

// Hàm xử lý gọi API tổng quát dựa theo tên bảng (Tối ưu hóa tái sử dụng)
export const getMasterData = async (endpoint: string) => {
    const res = await api.get(`/${endpoint}`);
    return res.data.data;
};

export const createMasterData = async (endpoint: string, body: any) => {
    const res = await api.post(`/${endpoint}`, body);
    return res.data;
};

export const updateMasterData = async (endpoint: string, id: number, body: any) => {
    const res = await api.put(`/${endpoint}/${id}`, body);
    return res.data;
};

export const deleteMasterData = async (endpoint: string, id: number) => {
    const res = await api.delete(`/${endpoint}/${id}`);
    return res.data;
};