import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; 

export default function EmployeeForm() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("hanh-chinh");

    // ==========================================
    // 1. STATE QUẢN LÝ DỮ LIỆU NHẬP LIỆU (TAB 1) - CHỈ CÒN ProvinceID VÀ WardID
    // ==========================================
    const [formData, setFormData] = useState({
        EmployeeCode: "",
        FullName: "",
        Gender: "Nam",
        DOB: "",
        CCCD: "",
        IssueDate: "",
        IssuePlace: "",
        Phone: "",
        Email: "",
        Ethnicity: "",
        Religion: "",
        ProvinceID: "", // Khóa ngoại trỏ trực tiếp về Dim_Provinces
        WardID: "",     // Khóa ngoại trỏ trực tiếp về Dim_Wards
        AddressDetail: ""
    });

    // ==========================================
    // 2. STATE DANH MỤC ĐỊA CHỈ ĐÃ LƯỢC BỎ CẤP HUYỆN
    // ==========================================
    const [provinces, setProvinces] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);

    // Tự động load danh mục Tỉnh ngay khi mở Form
    useEffect(() => {
        api.get("/master-data/provinces").then(res => setProvinces(res.data.data)).catch(console.error);
    }, []);

    // [CASCADING ĐÃ SỬA CHÍNH XÁC]: Chọn Tỉnh -> Gọi API lấy thẳng danh sách Phường/Xã thuộc Tỉnh đó
    const handleProvinceChange = async (provinceId: string) => {
        setFormData({ ...formData, ProvinceID: provinceId, WardID: "" });
        setWards([]); // Reset danh sách xã cũ ngay lập tức
        
        if (provinceId) {
            const res = await api.get(`/master-data/provinces/${provinceId}/wards`);
            setWards(res.data.data);
        }
    };

    const tabs = [
        { id: "hanh-chinh", name: "1. Hành chính & Địa chỉ", icon: "👤" },
        { id: "cong-tac", name: "2. Trình độ & Công tác", icon: "🏢" },
        { id: "chung-chi", name: "3. Chứng chỉ & Đảng", icon: "📜" },
        { id: "tien-luong", name: "4. Tiền lương", icon: "💰" },
    ];

    return (
        <div className="flex flex-col h-screen w-screen bg-[#F4F7FC] overflow-hidden">
            {/* HEADER KHU VỰC LÀM VIỆC */}
            <div className="bg-white px-8 py-5 border-b border-gray-200 shadow-sm flex justify-between items-center z-10">
                <div>
                    <h1 className="text-2xl font-bold text-[#1E293B]">✨ Thêm Mới Hồ Sơ Nhân Sự</h1>
                    <p className="text-sm text-gray-500 mt-1">Hệ thống Quản lý Nhân sự - Tiền lương Y tế</p>
                </div>
                <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-600 transition-colors font-medium text-sm flex items-center gap-2">
                    ✕ Đóng Form
                </button>
            </div>

            {/* THANH TABS ĐIỀU HƯỚNG */}
            <div className="bg-white px-8 border-b border-gray-200 z-10">
                <nav className="flex gap-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 text-sm font-bold flex items-center gap-2 border-b-[3px] transition-all ${
                                activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            <span>{tab.icon}</span> {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* KHÔNG GIAN NHẬP LIỆU */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 min-h-full">
                    
                    {/* GIAO DIỆN TAB 1: HÀNH CHÍNH & ĐỊA CHỈ */}
                    {activeTab === "hanh-chinh" && (
                        <div className="animate-fade-in space-y-8">
                            
                            {/* Khối I: Thông tin cơ bản */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">I. Thông tin cơ bản</h3>
                                <div className="grid grid-cols-4 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">MÃ NHÂN VIÊN <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="VD: NV001" value={formData.EmployeeCode} onChange={e => setFormData({...formData, EmployeeCode: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">HỌ VÀ TÊN <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Nhập họ và tên đầy đủ..." value={formData.FullName} onChange={e => setFormData({...formData, FullName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">GIỚI TÍNH</label>
                                        <select value={formData.Gender} onChange={e => setFormData({...formData, Gender: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none">
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NGÀY SINH</label>
                                        <input type="date" value={formData.DOB} onChange={e => setFormData({...formData, DOB: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">SỐ ĐIỆN THOẠI</label>
                                        <input type="text" placeholder="Số điện thoại mạng LAN/Di động" value={formData.Phone} onChange={e => setFormData({...formData, Phone: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">ĐỊA CHỈ EMAIL</label>
                                        <input type="email" placeholder="VD: bacsi@benhvien.vn" value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Khối II: Thông tin định danh */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">II. Thông tin định danh</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">SỐ CCCD <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Nhập số căn cước..." value={formData.CCCD} onChange={e => setFormData({...formData, CCCD: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NGÀY CẤP</label>
                                        <input type="date" value={formData.IssueDate} onChange={e => setFormData({...formData, IssueDate: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NƠI CẤP</label>
                                        <input type="text" placeholder="VD: Cục Cảnh sát QLHC về trật tự xã hội" value={formData.IssuePlace} onChange={e => setFormData({...formData, IssuePlace: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">DÂN TỘC</label>
                                        <input type="text" placeholder="VD: Kinh" value={formData.Ethnicity} onChange={e => setFormData({...formData, Ethnicity: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">TÔN GIÁO</label>
                                        <input type="text" placeholder="VD: Không" value={formData.Religion} onChange={e => setFormData({...formData, Religion: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Khối III: Địa chỉ thường trú (ĐÃ SỬA: CHỈ CÒN 2 Ô CHỌN CASCADING) */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">III. Địa chỉ thường trú</h3>
                                <div className="grid grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">TỈNH / THÀNH PHỐ</label>
                                        <select value={formData.ProvinceID} onChange={e => handleProvinceChange(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none transition-all">
                                            <option value="">-- Chọn Tỉnh / Thành phố --</option>
                                            {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">PHƯỜNG / XÃ (LỌC TRỰC TIẾP THEO TỈNH)</label>
                                        <select value={formData.WardID} onChange={e => setFormData({...formData, WardID: e.target.value})} disabled={!formData.ProvinceID} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none disabled:opacity-50 transition-all">
                                            <option value="">-- Chọn Phường / Xã --</option>
                                            {wards.map(w => <option key={w.WardID} value={w.WardID}>{w.WardName}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">SỐ NHÀ, TÊN THÔN/XÓM/ĐƯỜNG (CHI TIẾT)</label>
                                    <input type="text" placeholder="VD: Số nhà 45, Thôn Thượng..." value={formData.AddressDetail} onChange={e => setFormData({...formData, AddressDetail: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Khung của các Tab tiếp theo */}
                    {activeTab === "cong-tac" && <div className="text-center py-20 text-gray-400">Tab 2: Trình độ & Công tác (Sẽ thiết kế ở bước sau)</div>}
                    {activeTab === "chung-chi" && <div className="text-center py-20 text-gray-400">Tab 3: Chứng chỉ & Đảng (Sẽ thiết kế ở bước sau)</div>}
                    {activeTab === "tien-luong" && <div className="text-center py-20 text-gray-400">Tab 4: Thiết lập Tiền lương (Sẽ thiết kế ở bước sau)</div>}

                </div>
            </div>

            {/* STICKY FOOTER */}
            <div className="bg-white px-8 py-4 border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] flex justify-end gap-4 z-20">
                <button onClick={() => navigate("/")} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy bỏ</button>
                <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">💾 Lưu Nháp</button>
                <button className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">🚀 Lưu Chính Thức</button>
            </div>
        </div>
    );
}