import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

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

    // Gọi API lấy dữ liệu khi trang được load
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Hàm bọc lót đọc JSON an toàn (Giống bên EmployeeForm)
            const parseData = (res: any) => res.data?.data || (Array.isArray(res.data) ? res.data : []);

            // Gọi SONG SONG cả 2 API để tối ưu tốc độ và không bị kẹt lẫn nhau
            const [empRes, deptRes] = await Promise.all([
                api.get("/employees"),
                api.get("/departments")
            ]);

            // Xử lý dữ liệu Nhân viên
            const empData = parseData(empRes);
            setEmployees(empData);
            setFilteredEmployees(empData);

            // Xử lý dữ liệu Khoa/Phòng
            const deptData = parseData(deptRes);
            setDepartments(deptData);

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            alert("⚠️ Có lỗi khi tải dữ liệu từ máy chủ. Vui lòng ấn F12 sang tab Console để xem chi tiết lỗi đỏ nhé!");
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm xử lý Logic Lọc dữ liệu (Client-side Filtering)
    useEffect(() => {
        let result = employees;

        // Lọc theo từ khóa (Mã NV hoặc Tên)
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(emp => 
                (emp.EmployeeCode?.toLowerCase().includes(lowerSearch)) || 
                (emp.FullName?.toLowerCase().includes(lowerSearch)) ||
                (emp.PhoneNumber?.includes(searchTerm))
            );
        }

        // Lọc theo Khoa phòng
        if (selectedDept) {
            result = result.filter(emp => emp.DepartmentID?.toString() === selectedDept);
        }

        setFilteredEmployees(result);
    }, [searchTerm, selectedDept, employees]);

    // Format ngày tháng hiển thị
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN').format(date);
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#F4F7FC]">
            {/* HEADER & THANH CÔNG CỤ */}
            <div className="bg-white px-8 py-5 border-b border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 z-10">
                <div>
                    <h1 className="text-2xl font-bold text-[#1E293B]">👥 Danh sách Nhân sự</h1>
                    <p className="text-sm text-gray-500 mt-1">Tổng số: <span className="font-bold text-blue-600">{filteredEmployees.length}</span> nhân sự</p>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    {/* Ô Tìm kiếm */}
                    <div className="relative flex-1 md:w-64">
                        <input 
                            type="text" 
                            placeholder="Tìm mã NV, họ tên, SĐT..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    </div>

                    {/* Bộ lọc Khoa Phòng */}
                    <select 
                        value={selectedDept} 
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="py-2 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">Tất cả Khoa / Phòng ban</option>
                        {departments.map(d => (
                            <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
                        ))}
                    </select>

                    {/* Nút Thêm Mới */}
                    <button 
                        onClick={() => navigate("/employees/new")}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/30 hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        <span className="text-lg leading-none">+</span> Thêm Mới
                    </button>
                </div>
            </div>

            {/* MAIN DATA GRID (BẢNG DỮ LIỆU) */}
            <div className="flex-1 overflow-auto p-8">
                <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-600">
                            <tr>
                                <th className="px-6 py-4 font-bold">MÃ NV</th>
                                <th className="px-6 py-4 font-bold">HỌ VÀ TÊN</th>
                                <th className="px-6 py-4 font-bold">NGÀY SINH</th>
                                <th className="px-6 py-4 font-bold">KHOA / PHÒNG CÔNG TÁC</th>
                                <th className="px-6 py-4 font-bold">CHỨC DANH / CHỨC VỤ</th>
                                <th className="px-6 py-4 font-bold">TRẠNG THÁI</th>
                                <th className="px-6 py-4 font-bold text-center">THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        ⏳ Đang tải dữ liệu nhân sự...
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        ❌ Không tìm thấy hồ sơ nhân sự nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.EmployeeID} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-blue-900">{emp.EmployeeCode}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            {emp.FullName}
                                            <div className="text-xs font-normal text-gray-500 mt-0.5">{emp.Gender ? "Nam" : "Nữ"} - {emp.PhoneNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(emp.BirthDate)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                                                🏥 {emp.department?.DepartmentName || "Chưa phân khoa"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-800 font-medium">{emp.jobTitle?.JobTitleName || "Chưa có CDNN"}</div>
                                            {emp.position && (
                                                <div className="text-xs font-semibold text-orange-600 mt-0.5">⭐ {emp.position.PositionName}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${emp.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {emp.IsActive ? "Đang làm việc" : "Đã nghỉ việc"}
                                            </span>
                                            <div className="text-[10px] text-gray-500 mt-1 uppercase">{emp.EmployeeType}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => navigate(`/employee/edit/${emp.EmployeeID}`)} 
                                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors font-medium text-xs"
                                            >
                                                ✏️ Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}