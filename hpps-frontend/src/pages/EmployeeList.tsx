import { useEffect, useState } from "react";
import { getEmployees } from "../services/employeeService";

export default function EmployeeList() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getEmployees();
                setEmployees(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#F4F7FC]">
            {/* 1. SIDEBAR TRÁI: Màu xanh dương đậm cố định theo chuẩn Layout 2 */}
            <div className="w-64 bg-[#0A192F] text-gray-300 flex flex-col flex-shrink-0 shadow-lg">
                <div className="p-5 border-b border-slate-800 flex items-center gap-3">
                    {/* Logo Bệnh Viện */}
                    <img 
                        src="/logo-benhvien.jpg" 
                        alt="Logo Bệnh Viện" 
                        className="w-10 h-10 object-cover rounded-full border border-slate-700/50 shadow-md shadow-blue-500/5"
                    />
                    <div>
                        <h1 className="text-white font-bold text-sm tracking-wide">HPPS HEALTHCARE</h1>
                        <p className="text-[10px] text-blue-400 font-medium">Hệ Thống Nhân Sự & Lương</p>
                    </div>
                </div>
                
                {/* Menu Điều hướng */}
                <nav className="flex-1 p-4 space-y-1">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/10 transition-all">
                        <span>👤</span> Hồ sơ nhân sự
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800/60 hover:text-white transition-all text-gray-400">
                        <span>🏢</span> Phòng ban / Khoa
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800/60 hover:text-white transition-all text-gray-400">
                        <span>💳</span> Ngạch & Bậc lương
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800/60 hover:text-white transition-all text-gray-400">
                        <span>📜</span> Chứng chỉ CCHN / CME
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800/60 hover:text-white transition-all text-gray-400">
                        <span>📊</span> Quyết định nâng lương
                    </a>
                </nav>

                <div className="p-4 border-t border-slate-800 text-center text-[11px] text-gray-500">
                    Phiên bản 1.0.0 (Phase 1)
                </div>
            </div>

            {/* 2. KHÔNG GIAN NỘI DUNG CHÍNH CHỨA DATA GRID */}
            <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Top-bar điều hướng phụ */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Phân hệ Nhân sự</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-blue-600 font-medium">Danh sách hồ sơ nhân viên</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                            Vai trò: Quản lý Nhân sự tiền lương
                        </span>
                    </div>
                </header>

                {/* Vùng chứa Data Table */}
                <main className="flex-1 p-8 overflow-hidden flex flex-col">
                    
                    {/* Header Khối hành động */}
                    <div className="flex justify-between items-end mb-6 flex-shrink-0">
                        <div>
                            <h2 className="text-2xl font-bold text-[#1E293B]">Hồ sơ nhân sự</h2>
                            <p className="text-xs text-gray-500 mt-1">Quản lý toàn bộ thông tin hành chính, chứng chỉ hành nghề và bậc lương của viên chức.</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* Thanh tìm kiếm mô phỏng */}
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Tìm theo tên, mã hồ sơ..." 
                                    className="w-64 pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
                            </div>
                            
                            <button className="bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/10 hover:bg-blue-700 transition-all flex items-center gap-1.5">
                                <span className="text-sm">+</span> Thêm Nhân Viên Mới
                            </button>
                        </div>
                    </div>

                    {/* BẢNG DỮ LIỆU ĐỔ BÓNG 3D MÀU XANH NHẠT THEO TIÊU CHUẨN */}
                    <div className="flex-1 overflow-auto bg-white rounded-2xl border border-gray-100 shadow-[0_12px_30px_rgba(14,165,233,0.06)] flex flex-col">
                        <div className="inline-block min-w-full align-middle overflow-auto h-full">
                            <table className="min-w-full table-auto border-collapse text-left relative">
                                
                                {/* STICKY HEADER THEO CHUẨN */}
                                <thead className="sticky top-0 bg-[#F8FAFC] z-10 border-b border-gray-100 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                                    <tr>
                                        <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider w-24">Mã Hồ Sơ</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Họ và Tên</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Khoa / Phòng Ban</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Chức Vụ Quản Lý</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-[#475569] uppercase tracking-wider text-center w-32">Thao Tác</th>
                                    </tr>
                                </thead>
                                
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-10 text-xs text-gray-400 font-medium">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                    Đang tải dữ liệu y tế từ SQL Server...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : employees.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-10 text-sm text-gray-400">
                                                📭 Chưa có hồ sơ nhân viên nào được ghi nhận.
                                            </td>
                                        </tr>
                                    ) : (
                                        employees.map((emp, index) => (
                                            /* ZEBRA STRIPING: Dòng chẵn nền trắng, dòng lẻ nền xanh băng (Ice Blue - bg-[#F0F7FF]) */
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
                                                </td>
                                                <td className="px-6 py-3.5 text-xs text-[#475569] font-medium">
                                                    {emp.department ? emp.department.DepartmentName : "---"}
                                                </td>
                                                <td className="px-6 py-3.5 text-xs text-[#475569]">
                                                    {emp.position ? (
                                                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium text-[11px]">
                                                            {emp.position.PositionName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">Nhân viên</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5 text-xs text-center">
                                                    <button className="text-blue-600 font-bold hover:text-blue-800 transition-colors mr-3">
                                                        Xem hồ sơ
                                                    </button>
                                                    <button className="text-slate-400 font-medium hover:text-slate-600 transition-colors">
                                                        Sửa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}