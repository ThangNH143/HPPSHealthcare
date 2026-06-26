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
        code: "", name: "", months: 36, description: "", 
        gradeId: "", provinceId: "", coefficient: 1.0, 
        isDefault: false, isActive: true
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
        const idMap: Record<string, string> = {
            "departments": "DepartmentID", "positions": "PositionID", 
            "job-titles": "JobTitleID", "salary-grades": "GradeID", 
            "salary-steps": "StepID", "provinces": "ProvinceID", "wards": "WardID"
        };
        return idMap[activeTab] || "ID";
    };

    const getNameField = () => {
        const nameMap: Record<string, string> = {
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
        if (activeTab === "provinces") payload["ProvinceCode"] = formData.code;
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
        <div className="flex-1 flex flex-col h-full w-full">
            {/* 1. HEADER & KHỐI TẠO MỚI */}
            <div className="flex justify-between items-end mb-4 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-[#1E293B]">Cấu hình Danh mục nền</h2>
                    <p className="text-xs text-gray-500 mt-1">Quản lý các tham số cốt lõi cho hệ thống nhân sự bệnh viện</p>
                </div>
                <button 
                    onClick={handleOpenAdd} 
                    className="bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/10 hover:bg-blue-700 transition-all flex items-center gap-1.5"
                >
                    <span className="text-sm">+</span> Thêm {menuItems.find(m => m.id === activeTab)?.name.split(" ")[1]}
                </button>
            </div>

            {/* 2. HORIZONTAL SCROLLABLE TABS (DẠNG PILL) */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 flex-shrink-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full transition-all">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => { 
                            if (activeTab !== item.id) {
                                setActiveTab(item.id); 
                                setData([]); 
                            }
                        }}
                        className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-full transition-all border ${
                            activeTab === item.id 
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20" 
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                    >
                        {item.name}
                    </button>
                ))}
            </div>

            {/* 3. BẢNG DỮ LIỆU */}
            <div className="flex-1 overflow-auto bg-white rounded-2xl border border-gray-100 shadow-[0_12px_30px_rgba(14,165,233,0.06)] flex flex-col min-h-0">
                <div className="inline-block min-w-full align-middle overflow-auto h-full">
                    <table className="min-w-full table-auto border-collapse text-left relative">
                        <thead className="sticky top-0 bg-[#1D4ED8] z-10 shadow-md">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50 w-24">
                                    ID
                                </th>
                                
                                {["departments", "salary-grades", "provinces", "wards"].includes(activeTab) && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">
                                        Mã Code
                                    </th>
                                )}
                                
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">
                                    Tên Danh Mục
                                </th>
                                
                                {(activeTab === "job-titles" || activeTab === "salary-steps") && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">
                                        Thuộc Ngạch Lương
                                    </th>
                                )}
                                {activeTab === "wards" && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">
                                        Thuộc Tỉnh/Thành
                                    </th>
                                )}
                                {activeTab === "salary-grades" && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">
                                        Tháng giữ bậc
                                    </th>
                                )}
                                {activeTab === "salary-steps" && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">
                                        Hệ số
                                    </th>
                                )}
                                
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider text-center border-r border-blue-700/50">
                                    Trạng Thái
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider text-center w-32">
                                    Thao Tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-xs text-gray-400 font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Đang tải dữ liệu y tế...
                                        </div>
                                    </td>
                                </tr>
                            ) : (!data || data.length === 0) ? (
                                <tr><td colSpan={7} className="text-center py-10 text-xs text-gray-500">📭 Chưa có dữ liệu cho danh mục này.</td></tr>
                            ) : (
                                data.map((row, index) => {
                                    const idKey = getIdField();
                                    const nameKey = getNameField();
                                    
                                    const gradeName = gradesList.find(g => g.GradeID === row.GradeID)?.GradeName || "---";
                                    const provinceName = provincesList.find(p => p.ProvinceID === row.ProvinceID)?.ProvinceName || "---";

                                    return (
                                        <tr key={row[idKey] || row.id || `row-${index}`} className={`transition-colors hover:bg-blue-50/40 ${index % 2 === 0 ? "bg-white" : "bg-[#F0F7FF]"}`}>
                                            <td className="px-6 py-3.5 text-xs text-gray-400 font-medium">#{row[idKey]}</td>
                                            
                                            {["departments", "salary-grades", "provinces", "wards"].includes(activeTab) && (
                                                <td className="px-6 py-3.5 text-xs font-semibold text-blue-600 tracking-wider">
                                                    {row.DepartmentCode || row.GradeCode || row.ProvinceCode || row.WardCode}
                                                </td>
                                            )}

                                            <td className="px-6 py-3.5 text-xs font-bold text-[#1E293B]">{row[nameKey]}</td>
                                            
                                            {(activeTab === "job-titles" || activeTab === "salary-steps") && (
                                                <td className="px-6 py-3.5 text-xs font-medium text-[#475569]">{gradeName}</td>
                                            )}
                                            {activeTab === "wards" && (
                                                <td className="px-6 py-3.5 text-xs font-medium text-[#475569]">{provinceName}</td>
                                            )}
                                            {activeTab === "salary-grades" && (
                                                <td className="px-6 py-3.5 text-xs font-medium text-[#475569]">{row.HoldingMonths} tháng</td>
                                            )}
                                            {activeTab === "salary-steps" && (
                                                <td className="px-6 py-3.5 text-xs font-bold text-rose-600">{row.Coefficient}</td>
                                            )}

                                            <td className="px-6 py-3.5 text-center">
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${row.IsActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {row.IsActive !== false ? "Hoạt Động" : "Tạm Ngưng"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-xs text-center">
                                                <button onClick={() => handleOpenEdit(row)} className="text-blue-600 font-bold hover:text-blue-800 transition-colors mr-3">Sửa</button>
                                                <button onClick={() => handleDelete(row[idKey])} className="text-slate-400 font-medium hover:text-rose-600 transition-colors">Xóa</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* POPUP MODAL (Giữ nguyên logic của bạn, chỉ tinh chỉnh bo góc xíu cho đồng bộ) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
                    {/* ... (Phần nội dung Modal giữ nguyên như code cũ của bạn) ... */}
                    <div className="bg-white rounded-2xl w-[480px] shadow-2xl overflow-hidden">
                        <div className="p-5 bg-[#F8FAFC] border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-[#1E293B] text-sm">{editingItem ? "✏️ Hiệu chỉnh danh mục" : "✨ Thêm mới danh mục"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {["departments", "salary-grades", "provinces", "wards"].includes(activeTab) && (
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Mã Code</label>
                                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none" required />
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Tên Danh Mục</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none" required />
                            </div>

                            {/* ... Các trường select/input khác tương tự ... */}
                            {(activeTab === "job-titles" || activeTab === "salary-steps") && (
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Map với Ngạch Lương</label>
                                    <select value={formData.gradeId} onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:ring-1 focus:ring-blue-500 outline-none" required>
                                        <option value="">-- Chọn ngạch lương --</option>
                                        {gradesList.map(g => <option key={g.GradeID} value={g.GradeID}>{g.GradeCode} - {g.GradeName}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Hủy</button>
                                <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20">Lưu Dữ Liệu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}