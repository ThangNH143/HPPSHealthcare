// src/pages/EmployeeProfile.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function EmployeeProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get(`/employees/${id}/dashboard`);
                setProfile(res.data.data);
            } catch (error) {
                console.error("Lỗi tải hồ sơ:", error);
                alert("Không thể tải chi tiết hồ sơ.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, [id]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "---";
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // 1. Hàm fix lỗi mất số 0 ở điện thoại
    const formatPhone = (phone: any) => {
        if (!phone) return "---";
        const pStr = String(phone);
        return pStr.startsWith('0') ? pStr : `0${pStr}`;
    };

    // 2. Hàm gom chuỗi địa chỉ chi tiết đầy đủ
    const getFullAddress = () => {
        const parts = [];
        if (profile.HamletAddress) parts.push(profile.HamletAddress);
        if (profile.WardName) parts.push(profile.WardName);
        if (profile.ProvinceName) parts.push(profile.ProvinceName);
        return parts.length > 0 ? parts.join(", ") : "---";
    };

    if (isLoading) return <div className="flex h-full items-center justify-center">Đang tải hồ sơ y tế...</div>;
    if (!profile) return <div className="flex h-full items-center justify-center">Không tìm thấy dữ liệu!</div>;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* THAY ĐỔI: Bổ sung thanh Header chứa Nút Chỉnh Sửa */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/employees')}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                        &larr;
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-[#1E293B]">Dashboard Chi tiết Nhân sự</h2>
                        <p className="text-xs text-gray-500 mt-1">Mã NV: <span className="font-semibold text-blue-600">{profile.EmployeeCode}</span></p>
                    </div>
                </div>

                {/* NÚT CHỈNH SỬA HỒ SƠ - Dành riêng cho User có quyền */}
                <button 
                    onClick={() => navigate(`/employee/edit/${profile.EmployeeID}`)}
                    className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
                >
                    <span>✏️</span> Cập nhật thông tin
                </button>
            </div>

            {/* Khung Layout 2 Cột */}
            <div className="flex gap-6 flex-1 overflow-hidden">
                
                {/* CỘT TRÁI (30%): Profile Card */}
                <div className="w-[30%] bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(14,165,233,0.05)] p-6 flex flex-col flex-shrink-0 h-fit">
                    <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
                        <div className="w-24 h-24 rounded-full bg-blue-100 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-blue-800 mb-4">
                            {profile.FullName?.charAt(0) || "U"}
                        </div>
                        <h3 className="text-lg font-bold text-[#1E293B]">{profile.FullName}</h3>
                        <p className="text-sm font-semibold text-blue-600 mt-1">{profile.CurrentJobTitle || "Chưa có chức danh"}</p>
                        <span className={`mt-3 px-3 py-1 text-xs font-bold rounded-full ${profile.IsActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {profile.IsActive ? "Đang công tác" : "Đã nghỉ việc"}
                        </span>
                    </div>

                    <div className="py-6 space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nơi công tác</p>
                            <p className="text-sm font-semibold text-gray-800">{profile.CurrentDepartment || "---"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Chức vụ quản lý</p>
                            <p className="text-sm font-semibold text-gray-800">{profile.CurrentPosition || "Nhân viên"}</p>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">📞</div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Điện thoại</p>
                                    <p className="text-sm font-semibold text-gray-800">{formatPhone(profile.PhoneNumber)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">✉️</div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                    <p className="text-sm font-semibold text-gray-800">{profile.Email || "---"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI (70%): Nội dung dạng Tabs */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(14,165,233,0.05)] flex flex-col overflow-hidden">
                    <div className="flex border-b border-gray-100 px-6 pt-4 gap-6 flex-shrink-0">
                        {[
                            { id: 'overview', label: 'Tổng quan' },
                            { id: 'timeline', label: 'Quá trình Công tác' },
                            { id: 'credentials', label: 'Bằng cấp & CCHN' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
                                    activeTab === tab.id 
                                    ? "text-blue-600 border-blue-600" 
                                    : "text-gray-400 border-transparent hover:text-gray-600"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-auto p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Ngày sinh</p>
                                        <p className="text-sm font-semibold mt-1">{formatDate(profile.BirthDate)} ({profile.Gender ? "Nam" : "Nữ"})</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Loại nhân sự</p>
                                        <p className="text-sm font-semibold mt-1">{profile.EmployeeType || "---"}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">CCCD / Nơi cấp</p>
                                        <p className="text-sm font-semibold mt-1">{profile.IdentityCardNumber || "---"} <span className="text-xs font-normal text-gray-500">({profile.IdentityCardPlace})</span></p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Ngày vào Đảng chính thức</p>
                                        <p className="text-sm font-semibold text-rose-700 mt-1">{formatDate(profile.PartyJoinDateOfficial)}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Địa chỉ thường trú chi tiết</p>
                                    <p className="text-sm font-semibold mt-1">{getFullAddress()}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="pl-4">
                                <h4 className="text-sm font-bold text-gray-700 mb-6 uppercase">Lịch sử luân chuyển Khoa/Phòng</h4>
                                <div className="border-l-2 border-blue-100 space-y-6">
                                    {!profile.DepartmentHistory || profile.DepartmentHistory.length === 0 ? (
                                        <p className="pl-6 text-sm text-gray-400">Chưa có dữ liệu luân chuyển.</p>
                                    ) : (
                                        profile.DepartmentHistory.map((dept: any, idx: number) => (
                                            <div key={idx} className="relative pl-6">
                                                <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-1.5 ring-4 ring-blue-50"></div>
                                                <p className="text-xs font-bold text-blue-600 mb-0.5">{formatDate(dept.ValidFrom)}</p>
                                                <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm mt-2">
                                                    <p className="text-sm font-semibold text-gray-800">Quyết định về {dept.DepartmentName}</p>
                                                    {dept.DecisionURL && (
                                                        <a href={dept.DecisionURL} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-2 inline-block">📎 Xem file quyết định đính kèm</a>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'credentials' && (
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase">Chứng chỉ hành nghề (CCHN)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                            <p className="text-[10px] font-bold text-blue-400 uppercase">Số CCHN</p>
                                            <p className="text-sm font-semibold text-blue-900 mt-1">{profile.LicenseNumber || "Chưa cập nhật"}</p>
                                        </div>
                                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                            <p className="text-[10px] font-bold text-blue-400 uppercase">Ngày hết hạn / Đánh giá</p>
                                            <p className="text-sm font-semibold text-rose-600 mt-1">{formatDate(profile.LicenseEndDate)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase">Văn bằng & Chứng chỉ chuyên môn</h4>
                                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Loại</th>
                                                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Tên chứng chỉ</th>
                                                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Nơi cấp</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {!profile.Qualifications || profile.Qualifications.length === 0 ? (
                                                    <tr><td colSpan={3} className="px-4 py-6 text-center text-xs text-gray-400">Chưa có văn bằng nào được ghi nhận.</td></tr>
                                                ) : (
                                                    profile.Qualifications.map((q: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-xs font-medium text-gray-500">{q.QualType}</td>
                                                            <td className="px-4 py-3 text-xs font-bold text-gray-800">{q.QualName}</td>
                                                            <td className="px-4 py-3 text-xs text-gray-500">{q.IssuePlace || "---"}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}