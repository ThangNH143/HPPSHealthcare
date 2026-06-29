// src/pages/MasterDataSettings.tsx
import { useEffect, useState } from "react";
import { getMasterData, createMasterData, updateMasterData, deleteMasterData } from "../services/masterDataService";

// Hàm tạo mảng dãy số từ start đến end
const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, idx) => idx + start);
};

// Thuật toán tính toán các nút phân trang (Ellipsis Pagination)
const getPaginationRange = (currentPage: number, totalPages: number) => {
    const siblingCount = 3; 
    
    if (totalPages <= 7 + siblingCount) {
        return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!showLeftDots && showRightDots) {
        let leftItemCount = 3 + 2 * siblingCount;
        let leftRange = range(1, leftItemCount);
        return [...leftRange, '...', totalPages];
    }

    if (showLeftDots && !showRightDots) {
        let rightItemCount = 3 + 2 * siblingCount;
        let rightRange = range(totalPages - rightItemCount + 1, totalPages);
        return [firstPageIndex, '...', ...rightRange];
    }

    if (showLeftDots && showRightDots) {
        let middleRange = range(leftSiblingIndex, rightSiblingIndex);
        return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
    
    return range(1, totalPages);
};

export default function MasterDataSettings() {
    const [activeTab, setActiveTab] = useState("departments");
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // State phân trang
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    
    // Lưu danh sách tĩnh để làm Dropdown
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
            // Truyền page và limit xuống hàm API (nếu API support)
            const result = await getMasterData(activeTab, { page, limit });
            
            // Xử lý Fallback thông minh: Hỗ trợ cả Server-side Pagination & Client-side
            let rawData = result?.data || (Array.isArray(result) ? result : []);
            let meta = result?.meta;

            if (meta) {
                // Nếu Backend đã có phân trang
                setData(rawData);
                setTotalRecords(meta.total);
                setTotalPages(meta.totalPages);
            } else {
                // Nếu Backend trả toàn bộ dữ liệu (Client-side pagination)
                setTotalRecords(rawData.length);
                const calculatedTotalPages = Math.ceil(rawData.length / limit);
                setTotalPages(calculatedTotalPages);
                
                // Tránh lỗi khi trang hiện tại vượt quá tổng số trang mới
                const safePage = page > calculatedTotalPages ? Math.max(1, calculatedTotalPages) : page;
                if (safePage !== page) setPage(safePage);
                
                const startIndex = (safePage - 1) * limit;
                setData(rawData.slice(startIndex, startIndex + limit));
            }
            
            // Lấy dữ liệu dropdown không phân trang
            if (["job-titles", "salary-steps"].includes(activeTab) && gradesList.length === 0) {
                const grades = await getMasterData("salary-grades");
                setGradesList(grades?.data || (Array.isArray(grades) ? grades : []));
            }
            
            if (activeTab === "wards" && provincesList.length === 0) {
                const provs = await getMasterData("provinces");
                setProvincesList(provs?.data || (Array.isArray(provs) ? provs : []));
            }

        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
            // alert("Không thể kết nối dữ liệu danh mục y tế!");
        } finally {
            setLoading(false);
        }
    };

    // Gọi lại API khi activeTab, page, hoặc limit thay đổi
    useEffect(() => { 
        loadData(); 
    }, [activeTab, page, limit]);

    // Handle đổi Tab -> Phải reset trang về 1
    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
            setPage(1);
            setData([]); // Xóa dữ liệu cũ để hiện loading
        }
    };

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
                    <p className="text-xs text-gray-500 mt-1">
                        Hiển thị danh mục <span className="font-bold text-blue-600">{menuItems.find(m => m.id === activeTab)?.name.split(" ")[1]}</span>
                        {" "} - Tổng cộng: <span className="font-bold text-gray-700">{totalRecords}</span> bản ghi.
                    </p>
                </div>
                <button 
                    onClick={handleOpenAdd} 
                    className="bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/10 hover:bg-blue-700 transition-all flex items-center gap-1.5"
                >
                    <span className="text-sm">+</span> Thêm {menuItems.find(m => m.id === activeTab)?.name.split(" ")[1]}
                </button>
            </div>

            {/* 2. HORIZONTAL SCROLLABLE TABS */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 flex-shrink-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full transition-all">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
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
            <div className="flex-1 overflow-auto bg-white rounded-t-2xl border border-gray-100 shadow-[0_4px_20px_rgba(14,165,233,0.05)] flex flex-col min-h-0">
                <div className="inline-block min-w-full align-middle overflow-auto h-full">
                    <table className="min-w-full table-auto border-collapse text-left relative">
                        <thead className="sticky top-0 bg-[#1D4ED8] z-10 shadow-md">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50 w-24">ID</th>
                                {["departments", "salary-grades", "provinces", "wards"].includes(activeTab) && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">Mã Code</th>
                                )}
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">Tên Danh Mục</th>
                                {(activeTab === "job-titles" || activeTab === "salary-steps") && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">Thuộc Ngạch Lương</th>
                                )}
                                {activeTab === "wards" && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">Thuộc Tỉnh/Thành</th>
                                )}
                                {activeTab === "salary-grades" && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">Tháng giữ bậc</th>
                                )}
                                {activeTab === "salary-steps" && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">Hệ số</th>
                                )}
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider text-center border-r border-blue-700/50">Trạng Thái</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider text-center w-32">Thao Tác</th>
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

            {/* 4. KHỐI PAGINATION (PHÂN TRANG) */}
            <div className="bg-white border border-t-0 border-gray-100 rounded-b-2xl p-4 flex items-center justify-between flex-shrink-0 shadow-[0_4px_20px_rgba(14,165,233,0.05)]">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>Hiển thị</span>
                    <select 
                        value={limit} 
                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                        className="border border-gray-200 rounded px-2 py-1 bg-gray-50 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                    </select>
                    <span>bản ghi mỗi trang</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Trang trước
                    </button>
                    
                    {getPaginationRange(page, totalPages === 0 ? 1 : totalPages).map((pageNumber, index) => {
                        if (pageNumber === '...') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-1.5 py-1.5 text-xs font-medium text-gray-500 tracking-wider">
                                    ...
                                </span>
                            );
                        }
                        return (
                            <button
                                key={`page-${pageNumber}`}
                                onClick={() => setPage(pageNumber as number)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                    page === pageNumber 
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30" 
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-blue-600"
                                }`}
                            >
                                {pageNumber}
                            </button>
                        );
                    })}

                    <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || totalPages === 0}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Trang sau
                    </button>
                </div>
            </div>

            {/* POPUP MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
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