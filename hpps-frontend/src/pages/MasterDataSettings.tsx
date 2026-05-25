// src/pages/MasterDataSettings.tsx
import { useEffect, useState } from "react";
import { getMasterData, createMasterData, updateMasterData, deleteMasterData } from "../services/masterDataService";

export default function MasterDataSettings() {
    const [activeTab, setActiveTab] = useState("departments");
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Lưu danh sách Ngạch lương & Tỉnh/Thành để làm Dropdown
    const [gradesList, setGradesList] = useState<any[]>([]);
    const [provincesList, setProvincesList] = useState<any[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        months: 36,
        description: "",
        gradeId: "", 
        provinceId: "", // Map với ProvinceID
        coefficient: 1.0, 
        isDefault: false, 
        isActive: true
    });

    const menuItems = [
        { id: "departments", name: "🏢 Khoa / Phòng Ban" },
        { id: "provinces", name: "📍 Tỉnh / Thành Phố" },
        { id: "wards", name: "🏠 Phường / Xã" },
        { id: "positions", name: "👔 Chức Vụ Quản Lý" },
        { id: "job-titles", name: "⚕️ Chức Danh Nghề Nghiệp" },
        { id: "salary-grades", name: "💰 Ngạch Lương Hệ Thống" },
        { id: "salary-steps", name: "📈 Bậc Lương & Hệ Số" }
    ];

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getMasterData(activeTab);
            // Xử lý linh hoạt: Nếu API trả về {data: [...]}, ta lấy result.data. 
            // Nếu API trả về mảng trực tiếp, ta lấy result. 
            // Nếu lỗi/undefined, ta fallback về mảng rỗng []
            setData(result?.data || (Array.isArray(result) ? result : []));
            
            const grades = await getMasterData("salary-grades");
            setGradesList(grades?.data || (Array.isArray(grades) ? grades : []));
            
            const provs = await getMasterData("provinces");
            setProvincesList(provs?.data || (Array.isArray(provs) ? provs : []));
        } catch (error) {
            alert("Không thể kết nối dữ liệu danh mục y tế!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [activeTab]);

    const getIdField = () => {
        const idMap: any = {
            "departments": "DepartmentID", "positions": "PositionID", 
            "job-titles": "JobTitleID", "salary-grades": "GradeID", 
            "salary-steps": "StepID", "provinces": "ProvinceID", "wards": "WardID"
        };
        return idMap[activeTab] || "ID";
    };

    const getNameField = () => {
        const nameMap: any = {
            "departments": "DepartmentName", "positions": "PositionName", 
            "job-titles": "JobTitleName", "salary-grades": "GradeName", 
            "salary-steps": "StepName", "provinces": "ProvinceName", "wards": "WardName"
        };
        return nameMap[activeTab] || "Name";
    };

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({ 
            code: "", name: "", months: 36, description: "", 
            gradeId: "", provinceId: "", coefficient: 1.0, 
            isDefault: false, isActive: true 
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: any) => {
        setEditingItem(item);
        const nameKey = getNameField();
        
        setFormData({
            code: activeTab === "departments" ? item.DepartmentCode : 
                  activeTab === "salary-grades" ? item.GradeCode : 
                  activeTab === "provinces" ? item.ProvinceCode : 
                  activeTab === "wards" ? item.WardCode : "",
            name: item[nameKey],
            months: item.HoldingMonths || 36,
            description: item.Description || "",
            gradeId: item.GradeID || "",
            provinceId: item.ProvinceID || "",
            coefficient: item.Coefficient || 1.0,
            isDefault: item.IsDefault || false,
            isActive: item.IsActive !== false
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return alert("Vui lòng nhập tên danh mục!");

        let payload: any = {};
        const nameKey = getNameField();
        payload[nameKey] = formData.name;
        payload["IsActive"] = formData.isActive;

        if (activeTab === "departments") payload["DepartmentCode"] = formData.code;
        if (activeTab === "job-titles") {
            payload["Description"] = formData.description;
            payload["GradeID"] = formData.gradeId ? Number(formData.gradeId) : null;
        }
        if (activeTab === "salary-grades") {
            payload["GradeCode"] = formData.code;
            payload["HoldingMonths"] = Number(formData.months);
        }
        if (activeTab === "salary-steps") {
            payload["GradeID"] = formData.gradeId ? Number(formData.gradeId) : null;
            payload["Coefficient"] = Number(formData.coefficient);
            payload["IsDefault"] = formData.isDefault;
        }
        if (activeTab === "provinces") {
            payload["ProvinceCode"] = formData.code;
        }
        if (activeTab === "wards") {
            payload["WardCode"] = formData.code;
            payload["ProvinceID"] = formData.provinceId ? Number(formData.provinceId) : null;
        }

        try {
            if (editingItem) {
                const idKey = getIdField();
                await updateMasterData(activeTab, editingItem[idKey], payload);
            } else {
                await createMasterData(activeTab, payload);
            }
            setIsModalOpen(false);
            loadData(); 
        } catch (error) {
            alert("Lỗi xử lý lưu dữ liệu danh mục.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn danh mục này không?")) {
            try {
                const res = await deleteMasterData(activeTab, id);
                if (res.success) loadData();
            } catch (error: any) {
                alert(error.response?.data?.message || "Lỗi xóa danh mục.");
            }
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#F4F7FC]">
            {/* CỘT TRÁI: MENU DANH MỤC */}
            <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-[#1E293B]">Thiết lập Danh mục</h2>
                    <p className="text-xs text-gray-500 mt-1">Quản lý và cấu hình dữ liệu nền</p>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { 
                                setActiveTab(item.id); 
                                setData([]); // THÊM DÒNG NÀY: Xóa sạch data cũ ngay lập tức để chặn React render nhầm
                                setIsModalOpen(false); 
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                                activeTab === item.id 
                                    ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50" 
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            {item.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* CỘT PHẢI: BẢNG DỮ LIỆU */}
            <div className="flex-1 flex flex-col overflow-hidden p-8">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[#1E293B]">
                            {menuItems.find(m => m.id === activeTab)?.name}
                        </h2>
                    </div>
                    <button onClick={handleOpenAdd} className="bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all">
                        + Thêm Mới Danh Mục
                    </button>
                </div>

                <div className="flex-1 overflow-auto bg-white rounded-2xl border border-gray-100 shadow-[0_12px_30px_rgba(14,165,233,0.06)]">
                    <table className="min-w-full table-auto border-collapse text-left relative">
                        <thead className="sticky top-0 bg-[#F8FAFC] z-10 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider w-24">ID</th>
                                
                                {["departments", "salary-grades", "provinces", "wards"].includes(activeTab) && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Mã Code</th>
                                )}
                                
                                <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Tên Danh Mục</th>
                                
                                {(activeTab === "job-titles" || activeTab === "salary-steps") && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Thuộc Ngạch Lương</th>
                                )}
                                {activeTab === "wards" && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Thuộc Tỉnh/Thành</th>
                                )}
                                {activeTab === "salary-grades" && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Tháng giữ bậc</th>
                                )}
                                {activeTab === "salary-steps" && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Hệ số</th>
                                )}
                                
                                <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider text-center">Trạng Thái</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider text-center">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-10 text-xs text-gray-500 font-medium">⏳ Đang tải dữ liệu y tế...</td></tr>
                            ) : (!data || data.length === 0) ? (
                                <tr><td colSpan={7} className="text-center py-10 text-xs text-gray-500">Chưa có dữ liệu cho danh mục này.</td></tr>
                            ) : (
                                data.map((row, index) => {
                                    const idKey = getIdField();
                                    const nameKey = getNameField();
                                    
                                    const gradeName = gradesList.find(g => g.GradeID === row.GradeID)?.GradeName || "---";
                                    const provinceName = provincesList.find(p => p.ProvinceID === row.ProvinceID)?.ProvinceName || "---";

                                    return (
                                        // Cập nhật thẻ tr: Dùng idKey, nếu undefined thì lấy id, nếu vẫn không có thì dùng index
                                        <tr key={row[idKey] || row.id || `row-${index}`} className="hover:bg-blue-50/30">
                                            <td className="px-6 py-3.5 text-xs text-gray-400">#{row[idKey]}</td>
                                            
                                            {["departments", "salary-grades", "provinces", "wards"].includes(activeTab) && (
                                                <td className="px-6 py-3.5 text-xs font-bold text-blue-600">
                                                    {row.DepartmentCode || row.GradeCode || row.ProvinceCode || row.WardCode}
                                                </td>
                                            )}

                                            <td className="px-6 py-3.5 text-xs font-bold text-[#1E293B]">{row[nameKey]}</td>
                                            
                                            {(activeTab === "job-titles" || activeTab === "salary-steps") && (
                                                <td className="px-6 py-3.5 text-xs font-medium text-emerald-600">{gradeName}</td>
                                            )}
                                            {activeTab === "wards" && (
                                                <td className="px-6 py-3.5 text-xs font-medium text-emerald-600">{provinceName}</td>
                                            )}
                                            {activeTab === "salary-grades" && (
                                                <td className="px-6 py-3.5 text-xs">{row.HoldingMonths} tháng</td>
                                            )}
                                            {activeTab === "salary-steps" && (
                                                <td className="px-6 py-3.5 text-xs font-bold text-red-500">{row.Coefficient}</td>
                                            )}

                                            <td className="px-6 py-3.5 text-xs text-center">
                                                {row.IsActive === false ? (
                                                    <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-[10px]">Tạm Ngưng</span>
                                                ) : (
                                                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px]">Hoạt Động</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5 text-xs text-center">
                                                <button onClick={() => handleOpenEdit(row)} className="text-blue-600 hover:text-blue-800 mr-4">Sửa</button>
                                                <button onClick={() => handleDelete(row[idKey])} className="text-gray-400 hover:text-red-600">Xóa</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* POPUP MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-[480px] shadow-2xl overflow-hidden">
                        <div className="p-6 bg-[#F8FAFC] border-b border-gray-100 flex justify-between">
                            <h3 className="font-bold text-[#1E293B]">{editingItem ? "✏️ Hiệu chỉnh" : "✨ Thêm mới"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 font-bold">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {["departments", "salary-grades", "provinces", "wards"].includes(activeTab) && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">MÃ CODE</label>
                                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border rounded-xl" required />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">TÊN DANH MỤC</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-xl" required />
                            </div>

                            {(activeTab === "job-titles" || activeTab === "salary-steps") && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">MAP VỚI NGẠCH LƯƠNG</label>
                                    <select value={formData.gradeId} onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-white" required>
                                        <option value="">-- Chọn ngạch lương --</option>
                                        {gradesList.map(g => (
                                            <option key={g.GradeID} value={g.GradeID}>{g.GradeCode} - {g.GradeName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {activeTab === "wards" && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">MAP VỚI TỈNH / THÀNH PHỐ</label>
                                    <select value={formData.provinceId} onChange={(e) => setFormData({ ...formData, provinceId: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-white" required>
                                        <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                        {provincesList.map(p => (
                                            <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceCode} - {p.ProvinceName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {activeTab === "salary-grades" && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">THÁNG GIỮ BẬC (ĐỊNH KỲ)</label>
                                    <input type="number" value={formData.months} onChange={(e) => setFormData({ ...formData, months: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-xl" required />
                                </div>
                            )}

                            {activeTab === "salary-steps" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">HỆ SỐ LƯƠNG</label>
                                        <input type="number" step="0.01" value={formData.coefficient} onChange={(e) => setFormData({ ...formData, coefficient: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-xl" required />
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="ml-2 text-xs font-bold text-gray-600">Là bậc khởi điểm?</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center pt-2">
                                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                                <span className="ml-2 text-xs font-bold text-gray-600">Kích hoạt sử dụng</span>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-xl">Hủy</button>
                                <button type="submit" className="px-5 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700">Lưu Dữ Liệu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}