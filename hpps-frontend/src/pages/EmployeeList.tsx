// src/pages/EmployeeList.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Đảm bảo import đúng cấu hình Axios của bạn

export default function EmployeeList() {
    const navigate = useNavigate();
    
    // State lưu trữ dữ liệu
    const [employees, setEmployees] = useState<any[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State phục vụ Bộ lọc (Filters)
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDept, setSelectedDept] = useState("");

    // Gọi API lấy dữ liệu khi trang được load (Tuân thủ nguyên tắc chạy song song)
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const parseData = (res: any) => res.data?.data || (Array.isArray(res.data) ? res.data : []);

                const [empRes, deptRes] = await Promise.all([
                    api.get("/employees"),
                    api.get("/departments")
                ]);

                const empData = parseData(empRes);
                setEmployees(empData);
                setFilteredEmployees(empData);

                const deptData = parseData(deptRes);
                setDepartments(deptData);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                // Thực tế nên dùng Toast notification thay vì alert
                alert("⚠️ Có lỗi khi tải dữ liệu từ máy chủ.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Hàm xử lý Logic Lọc dữ liệu (Client-side Filtering)
    useEffect(() => {
        let result = employees;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(emp => 
                (emp.EmployeeCode?.toLowerCase().includes(lowerSearch)) || 
                (emp.FullName?.toLowerCase().includes(lowerSearch)) ||
                (emp.PhoneNumber?.includes(searchTerm))
            );
        }

        if (selectedDept) {
            result = result.filter(emp => emp.DepartmentID?.toString() === selectedDept);
        }

        setFilteredEmployees(result);
    }, [searchTerm, selectedDept, employees]);

    // Format ngày tháng (An toàn tránh crash UI)
    const formatDate = (dateString: string) => {
        if (!dateString) return "---";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN').format(date);
    };

    return (
        <>
            {/* Header Khối hành động & Bộ lọc */}
            <div className="flex justify-between items-end mb-6 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-[#1E293B]">Hồ sơ nhân sự</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Hiển thị <span className="font-bold text-blue-600">{filteredEmployees.length}</span> nhân sự hợp lệ.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Bộ lọc Khoa Phòng */}
                    <select 
                        value={selectedDept} 
                        onChange={(e) => setSelectedDept(e.target.value)}
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
                            placeholder="Tìm theo tên, mã hồ sơ, SĐT..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                </div>
            </div>

            {/* BẢNG DỮ LIỆU ĐỔ BÓNG 3D */}
            <div className="flex-1 overflow-auto bg-white rounded-2xl border border-gray-100 shadow-[0_12px_30px_rgba(14,165,233,0.06)] flex flex-col">
                <div className="inline-block min-w-full align-middle overflow-auto h-full">
                    <table className="min-w-full table-auto border-collapse text-left relative">
                        
                        <thead className="sticky top-0 bg-[#1D4ED8] z-10 shadow-md">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50 w-24">
                                    Mã NV
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">
                                    Họ và Tên
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">
                                    Ngày Sinh
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">
                                    Khoa / Phòng Ban
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">
                                    Chức Danh/Vụ
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-blue-700/50">
                                    Trạng Thái
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-white uppercase tracking-wider text-center w-32">
                                    Thao Tác
                                </th>
                            </tr>
                        </thead>
                        
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-xs text-gray-400 font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Đang tải dữ liệu y tế từ SQL Server...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-sm text-gray-400">
                                        📭 Không tìm thấy hồ sơ nhân viên nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp, index) => (
                                    <tr 
                                        key={emp.EmployeeID} 
                                        className={`transition-colors hover:bg-blue-50/40 ${
                                            index % 2 === 0 ? "bg-white" : "bg-[#F0F7FF]"
                                        }`}
                                    >
                                        <td className="px-6 py-3.5 text-xs font-semibold text-blue-600 tracking-wider">
                                            {emp.EmployeeCode}
                                        </td>
                                        <td className="px-6 py-3.5 text-xs font-bold text-[#1E293B]">
                                            {emp.FullName}
                                            <div className="text-[10px] font-normal text-gray-500 mt-0.5">
                                                {emp.Gender ? "Nam" : "Nữ"} - {emp.PhoneNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-[#475569]">
                                            {formatDate(emp.BirthDate)}
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-[#475569] font-medium">
                                            {emp.department ? emp.department.DepartmentName : "---"}
                                        </td>
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
                                                onClick={() => navigate(`/employee/edit/${emp.EmployeeID}`)}
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
        </>
    );
}