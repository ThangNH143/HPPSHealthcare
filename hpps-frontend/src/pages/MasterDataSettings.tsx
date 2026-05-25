import { useEffect, useState } from "react";
import { getMasterData, createMasterData, updateMasterData, deleteMasterData } from "../services/masterDataService";

export default function MasterDataSettings() {
    // Đã sửa mặc định khởi tạo
    const [activeTab, setActiveTab] = useState("departments");
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        months: 36,
        description: "",
        isActive: true
    });

    // BƯỚC SỬA LỖI 1: Đồng bộ ID tab khớp 100% với tên Route Backend (Thêm gạch ngang)
    const menuItems = [
        { id: "departments", name: "🏢 Khoa / Phòng Ban" },
        { id: "positions", name: "👔 Chức Vụ Quản Lý" },
        { id: "job-titles", name: "⚕️ Chức Danh Nghề Nghiệp" },
        { id: "salary-grades", name: "💰 Ngạch Lương Hệ Thống" },
    ];

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getMasterData(activeTab);
            setData(result);
        } catch (error) {
            alert("Không thể kết nối dữ liệu danh mục y tế!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    // BƯỚC SỬA LỖI 2: Cập nhật lại các điều kiện if/else
    const getIdField = () => activeTab === "departments" ? "DepartmentID" : activeTab === "positions" ? "PositionID" : activeTab === "job-titles" ? "JobTitleID" : "GradeID";
    const getNameField = () => activeTab === "departments" ? "DepartmentName" : activeTab === "positions" ? "PositionName" : activeTab === "job-titles" ? "JobTitleName" : "GradeName";

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({ code: "", name: "", months: 36, description: "", isActive: true });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: any) => {
        setEditingItem(item);
        const nameKey = getNameField();
        
        setFormData({
            code: activeTab === "departments" ? item.DepartmentCode : activeTab === "salary-grades" ? item.GradeCode : "",
            name: item[nameKey],
            months: item.HoldingMonths || 36,
            description: item.Description || "",
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
        if (activeTab === "job-titles") payload["Description"] = formData.description; // Đã sửa
        if (activeTab === "salary-grades") { // Đã sửa
            payload["GradeCode"] = formData.code;
            payload["HoldingMonths"] = Number(formData.months);
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
                if (res.success) {
                    loadData();
                }
            } catch (error: any) {
                alert(error.response?.data?.message || "Lỗi xóa danh mục.");
            }
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#F4F7FC]">
            <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-[#1E293B]">Thiết lập Danh mục</h2>
                    <p className="text-xs text-gray-500 mt-1">Quản lý và cấu hình dữ liệu nền</p>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsModalOpen(false); }}
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

            <div className="flex-1 flex flex-col overflow-hidden p-8">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[#1E293B]">
                            {menuItems.find(m => m.id === activeTab)?.name}
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">Dữ liệu đồng bộ thời gian thực với cơ sở dữ liệu SQL Server.</p>
                    </div>
                    <button 
                        onClick={handleOpenAdd}
                        className="bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/10 hover:bg-blue-700 transition-all"
                    >
                        + Thêm Mới Danh Mục
                    </button>
                </div>

                <div className="flex-1 overflow-auto bg-white rounded-2xl border border-gray-100 shadow-[0_12px_30px_rgba(14,165,233,0.06)]">
                    <table className="min-w-full table-auto border-collapse text-left relative">
                        <thead className="sticky top-0 bg-[#F8FAFC] z-10 border-b border-gray-100 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider w-24">Mã định danh</th>
                                {(activeTab === "departments" || activeTab === "salary-grades") && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider w-32">Mã Code</th>
                                )}
                                <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Tên Danh Mục Hệ Thống</th>
                                {activeTab === "salary-grades" && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider w-40">Tháng giữ bậc</th>
                                )}
                                <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider text-center w-32">Trạng Thái</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider text-center w-40">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-xs text-gray-400 font-medium">Đang tải dữ liệu y tế...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-xs text-gray-400">Hệ thống trống. Nhấp thêm mới để tạo dữ liệu.</td></tr>
                            ) : (
                                data.map((row, index) => {
                                    const idKey = getIdField();
                                    const nameKey = getNameField();
                                    return (
                                        <tr key={row[idKey]} className={`transition-colors hover:bg-blue-50/30 ${index % 2 === 0 ? "bg-white" : "bg-[#F0F7FF]"}`}>
                                            <td className="px-6 py-3.5 text-xs font-semibold text-gray-400 tracking-wider">#{row[idKey]}</td>
                                            {activeTab === "departments" && <td className="px-6 py-3.5 text-xs font-bold text-blue-600">{row.DepartmentCode}</td>}
                                            {activeTab === "salary-grades" && <td className="px-6 py-3.5 text-xs font-bold text-blue-600">{row.GradeCode}</td>}
                                            <td className="px-6 py-3.5 text-xs font-bold text-[#1E293B]">{row[nameKey]}</td>
                                            {activeTab === "salary-grades" && <td className="px-6 py-3.5 text-xs text-gray-600 font-medium">{row.HoldingMonths} tháng</td>}
                                            <td className="px-6 py-3.5 text-xs text-center">
                                                {row.IsActive === false ? (
                                                    <span className="bg-red-50 text-red-600 border border-red-200/50 px-2.5 py-1 rounded-lg font-bold text-[10px]">Tạm Ngưng</span>
                                                ) : (
                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2.5 py-1 rounded-lg font-bold text-[10px]">Hoạt Động</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5 text-xs text-center">
                                                <button 
                                                    onClick={() => handleOpenEdit(row)}
                                                    className="text-blue-600 font-bold hover:text-blue-800 transition-colors mr-4"
                                                >
                                                    Sửa
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(row[idKey])}
                                                    className="text-gray-400 font-medium hover:text-red-600 transition-colors"
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* POPUP MODAL ĐỔ BÓNG 3D PHÒNG CÁCH MEDICAL TRUST BLUE */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_20px_50px_rgba(15,23,42,0.15)] w-[480px] overflow-hidden">
                        <div className="p-6 bg-[#F8FAFC] border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-base font-bold text-[#1E293B]">
                                {editingItem ? "✏️ Hiệu chỉnh danh mục" : "✨ Thêm mới danh mục"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {(activeTab === "departments" || activeTab === "salary-grades") && (
                                <div>
                                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1.5">Mã viết tắt / Code</label>
                                    <input 
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="Ví dụ: KLS, V.08.01.02..."
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1.5">Tên danh mục y tế</label>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nhập tên chính thức..."
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm"
                                    required
                                />
                            </div>

                            {activeTab === "salary-grades" && (
                                <div>
                                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1.5">Thời gian giữ bậc định kỳ (Tháng)</label>
                                    <input 
                                        type="number"
                                        value={formData.months}
                                        onChange={(e) => setFormData({ ...formData, months: Number(e.target.value) })}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm"
                                        required
                                    />
                                </div>
                            )}

                            {activeTab === "job-titles" && (
                                <div>
                                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1.5">Mô tả chức danh nghề nghiệp</label>
                                    <textarea 
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm h-20 resize-none"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <div>
                                    <h4 className="text-xs font-bold text-[#1E293B]">Trạng thái kích hoạt</h4>
                                    <p className="text-[11px] text-gray-400">Nếu ngưng, danh mục sẽ ẩn khỏi Dropdown form Nhân sự.</p>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-colors"
                                >
                                    Lưu Dữ Liệu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}