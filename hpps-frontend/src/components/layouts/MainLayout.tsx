// src/components/layouts/MainLayout.tsx
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import logoBenhVien from "../../assets/logo-benhvien.jpg"; // Đảm bảo đường dẫn đúng

export default function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    // Hàm kiểm tra active
    const checkIsActive = (path: string) => {
        if (path === '/employees' && (location.pathname === '/' || location.pathname.startsWith('/employee'))) return true;
        return location.pathname.startsWith(path);
    };

    // Class CSS mới cho Menu (Tươi hơn, có viền trái khi active giống phong cách HIS)
    const activeMenuClass = "flex items-center gap-3 px-4 py-3 text-sm font-semibold bg-[#2170B9] text-white border-l-4 border-white transition-all";
    const inactiveMenuClass = "flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-100 hover:bg-[#003B73] hover:text-white border-l-4 border-transparent transition-all";

    const getPageTitle = () => {
        if (location.pathname.startsWith('/employee') || location.pathname === '/') return "HỒ SƠ NHÂN SỰ";
        if (location.pathname.startsWith('/settings')) return "DANH MỤC HỆ THỐNG";
        return "TỔNG QUAN HỆ THỐNG";
    };

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            navigate("/login"); // Điều hướng về trang đăng nhập sau này
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#F4F7FC]">
            {/* SIDEBAR TRÁI: Màu Xanh Y Tế (Medical Blue) */}
            <div className="w-64 bg-[#004A8F] text-white flex flex-col flex-shrink-0 shadow-xl z-20">
                {/* Logo Bệnh Viện */}
                <div className="p-4 flex items-center gap-3 bg-[#00417D]">
                    <img 
                        src={logoBenhVien} 
                        alt="Logo" 
                        className="w-10 h-10 object-cover rounded-full border-2 border-white/20 shadow-md bg-white"
                    />
                    <div>
                        <h1 className="font-bold text-sm tracking-wide">HPPS HEALTHCARE</h1>
                        <p className="text-[10px] text-blue-200">Hệ Thống Nhân Sự & Lương</p>
                    </div>
                </div>

                {/* Khu vực Thông tin User (Profile Box) như hình mẫu */}
                <div className="px-4 py-5 flex items-center gap-3 border-b border-[#003B73] bg-[#004A8F]">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-lg border-2 border-blue-300 shadow-inner">
                        T
                    </div>
                    <div>
                        <p className="font-bold text-sm">Administrator</p>
                        <p className="text-[11px] text-blue-200 mt-0.5">Quản trị Nhân sự</p>
                    </div>
                </div>
                
                {/* MENU ĐIỀU HƯỚNG */}
                <nav className="flex-1 py-2 overflow-y-auto">
                    <Link to="/employees" className={checkIsActive('/employees') ? activeMenuClass : inactiveMenuClass}>
                        <span className="text-lg">👥</span> Hồ sơ nhân sự
                    </Link>
                    <Link to="/settings" className={checkIsActive('/settings') ? activeMenuClass : inactiveMenuClass}>
                        <span className="text-lg">🏢</span> Danh mục
                    </Link>
                    <Link to="#" className={inactiveMenuClass}>
                        <span className="text-lg">💳</span> Ngạch & Bậc lương
                    </Link>
                    <Link to="#" className={inactiveMenuClass}>
                        <span className="text-lg">📜</span> Chứng chỉ CCHN
                    </Link>
                    <Link to="#" className={inactiveMenuClass}>
                        <span className="text-lg">📊</span> Quyết định nâng lương
                    </Link>
                </nav>

                <div className="p-3 bg-[#003B73] text-center text-[10px] text-blue-300">
                    Phiên bản 1.0.0
                </div>
            </div>

            {/* KHÔNG GIAN NỘI DUNG CHÍNH */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TOP HEADER: Viền trái xanh & Nút đăng xuất đỏ */}
                <header className="h-14 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex items-center justify-between px-6 flex-shrink-0 z-10">
                    <div className="flex items-center">
                        <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                        <h2 className="text-blue-800 font-bold text-lg">{getPageTitle()}</h2>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-rose-600 hover:text-rose-800 font-semibold text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50"
                    >
                        <span>Đăng xuất</span> ↪
                    </button>
                </header>

                <main className="flex-1 p-6 overflow-hidden flex flex-col bg-[#F4F7FC]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}