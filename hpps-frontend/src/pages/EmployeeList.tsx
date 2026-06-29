// src/pages/EmployeeList.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function EmployeeList() {
    const navigate = useNavigate();
    
    // State lưu trữ dữ liệu
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State phục vụ Server-side Pagination & Filter
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15); // Mặc định 15 dòng/trang
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Tải danh sách Khoa phòng (Chỉ gọi 1 lần khi load trang)
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get("/departments");
                setDepartments(res.data?.data || (Array.isArray(res.data) ? res.data : []));
            } catch (error) {
                console.error("Lỗi tải danh mục khoa phòng:", error);
            }
        };
        fetchDepartments();
    }, []);

    // Tải danh sách Nhân sự (Gọi lại mỗi khi page, limit, search, dept thay đổi)
    useEffect(() => {
        const fetchEmployees = async () => {
            setIsLoading(true);
            try {
                // Đẩy params xuống backend
                const res = await api.get("/employees", {
                    params: {
                        page,
                        limit,
                        search: searchTerm,
                        departmentId: selectedDept
                    }
                });

                // Cấu trúc response kỳ vọng: { success: true, data: [...], meta: { total, totalPages, page } }
                const data = res.data?.data || [];
                const meta = res.data?.meta || { total: data.length, totalPages: 1 };

                setEmployees(data);
                setTotalRecords(meta.total);
                setTotalPages(meta.totalPages);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu nhân sự:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Kỹ thuật Debounce cơ bản cho Search: Tránh gõ 1 phím gọi API 1 lần
        const timeoutId = setTimeout(() => {
            fetchEmployees();
        }, 300); // Đợi 300ms sau khi ngừng gõ mới gọi API

        return () => clearTimeout(timeoutId);
    }, [page, limit, searchTerm, selectedDept]);

    // State khóa nút khi đang tải Excel (Tránh user bấm nhiều lần)
    const [isExporting, setIsExporting] = useState(false);

    // Xử lý xuất Excel
    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            // Quan trọng: Phải có responseType: 'blob' để nhận file nhị phân
            const response = await api.get("/employees/export", {
                params: { 
                    search: searchTerm, 
                    departmentId: selectedDept 
                },
                responseType: 'blob' 
            });

            // Kỹ thuật tạo thẻ <a> ẩn để ép trình duyệt tải file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Đặt tên file có kèm ngày tháng
            const dateStr = new Intl.DateTimeFormat('vi-VN').format(new Date()).replace(/\//g, '-');
            link.setAttribute('download', `DS_NhanSu_${dateStr}.xlsx`);
            
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Lỗi khi xuất file Excel:", error);
            alert("⚠️ Đã có lỗi xảy ra khi xuất file Excel.");
        } finally {
            setIsExporting(false);
        }
    };

    // Handle thay đổi Filter -> Reset về trang 1
    const handleFilterChange = (type: 'search' | 'dept', value: string) => {
        if (type === 'search') setSearchTerm(value);
        if (type === 'dept') setSelectedDept(value);
        setPage(1); // Luôn quay về trang 1 khi filter thay đổi
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "---";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN').format(date);
    };

    // Hàm tạo mảng dãy số từ start đến end
    const range = (start: number, end: number) => {
        return Array.from({ length: end - start + 1 }, (_, idx) => idx + start);
    };

    // Thuật toán tính toán các nút phân trang (Ellipsis Pagination)
    const getPaginationRange = (currentPage: number, totalPages: number) => {
        // Rút gọn theo yêu cầu: Chỉ hiện 3 trang lân cận trước/sau
        const siblingCount = 3; 
        
        // Nếu tổng số trang quá nhỏ, hiển thị toàn bộ
        if (totalPages <= 7 + siblingCount) {
            return range(1, totalPages);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const showLeftDots = leftSiblingIndex > 2;
        const showRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        // Tình huống 1: Chỉ hiện dấu ... ở bên phải
        if (!showLeftDots && showRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = range(1, leftItemCount);
            return [...leftRange, '...', totalPages];
        }

        // Tình huống 2: Chỉ hiện dấu ... ở bên trái
        if (showLeftDots && !showRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = range(totalPages - rightItemCount + 1, totalPages);
            return [firstPageIndex, '...', ...rightRange];
        }

        // Tình huống 3: Hiện dấu ... ở cả hai bên
        if (showLeftDots && showRightDots) {
            let middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
        }
        
        return range(1, totalPages);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header Khối hành động & Bộ lọc */}
            <div className="flex justify-between items-end mb-4 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-[#1E293B]">Hồ sơ nhân sự</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Hiển thị <span className="font-bold text-blue-600">{employees.length}</span> / Tổng số <span className="font-bold text-gray-700">{totalRecords}</span> nhân sự.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Bộ lọc Khoa Phòng */}
                    <select 
                        value={selectedDept} 
                        onChange={(e) => handleFilterChange('dept', e.target.value)}
                        className="py-2.5 px-4 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                    >
                        <option value="">Tất cả Khoa / Phòng ban</option>
                        {departments.map(d => (
                            <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
                        ))}
                    </select>

                    {/* Thanh tìm kiếm */}
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Tìm mã NV, tên, SĐT..." 
                            value={searchTerm}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-64 pl-9 pr-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/employees/new')}
                        className="bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/10 hover:bg-blue-700 transition-all flex items-center gap-1.5"
                    >
                        <span className="text-sm">+</span> Thêm Nhân Viên
                    </button>

                    {/* Nút Xuất Excel */}
                    <button 
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/10 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-wait transition-all flex items-center gap-1.5"
                    >
                        {isExporting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span className="text-sm">📥</span>
                        )}
                        Xuất Excel
                    </button>
                </div>
            </div>

            {/* BẢNG DỮ LIỆU ĐỔ BÓNG */}
            <div className="flex-1 overflow-auto bg-white rounded-t-2xl border border-gray-100 shadow-[0_4px_20px_rgba(14,165,233,0.05)] flex flex-col">
                <div className="inline-block min-w-full align-middle overflow-auto h-full">
                    <table className="min-w-full table-auto border-collapse text-left relative">
                        <thead className="sticky top-0 bg-[#1D4ED8] z-10 shadow-md">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50 w-24">Mã NV</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">Họ và Tên</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">Ngày Sinh</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">Khoa / Phòng Ban</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">Chức Danh/Vụ</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">Trạng Thái</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider text-center w-32">Thao Tác</th>
                            </tr>
                        </thead>
                        
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-xs text-gray-400 font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Đang tải dữ liệu y tế...
                                        </div>
                                    </td>
                                </tr>
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-sm text-gray-400">
                                        📭 Không tìm thấy hồ sơ nhân viên nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp, index) => (
                                    <tr 
                                        key={emp.EmployeeID} 
                                        className={`transition-colors hover:bg-blue-50/40 ${index % 2 === 0 ? "bg-white" : "bg-[#F0F7FF]"}`}
                                    >
                                        <td className="px-6 py-3.5 text-xs font-semibold text-blue-600 tracking-wider">{emp.EmployeeCode}</td>
                                        <td className="px-6 py-3.5 text-xs font-bold text-[#1E293B]">
                                            {emp.FullName}
                                            <div className="text-[10px] font-normal text-gray-500 mt-0.5">
                                                {emp.Gender ? "Nam" : "Nữ"} - {emp.PhoneNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-[#475569]">{formatDate(emp.BirthDate)}</td>
                                        <td className="px-6 py-3.5 text-xs text-[#475569] font-medium">{emp.department ? emp.department.DepartmentName : "---"}</td>
                                        <td className="px-6 py-3.5 text-xs text-[#475569]">
                                            <div className="font-medium">{emp.jobTitle?.JobTitleName || "---"}</div>
                                            {emp.position && (
                                                <span className="inline-block mt-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium text-[10px]">
                                                    {emp.position.PositionName}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${emp.IsActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {emp.IsActive ? "Đang làm việc" : "Đã nghỉ việc"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-center">
                                            <button 
                                                onClick={() => navigate(`/employee/dashboard/${emp.EmployeeID}`)}
                                                className="text-blue-600 font-bold hover:text-blue-800 transition-colors mr-3"
                                            >
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* KHỐI PAGINATION (PHÂN TRANG) */}
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
                    {/* Nút Trang Trước */}
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Trang trước
                    </button>
                    
                    {/* Render các phím số & Dấu chấm lửng */}
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

                    {/* Nút Trang Sau */}
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || totalPages === 0}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Trang sau
                    </button>
                </div>
            </div>
        </div>
    );
}