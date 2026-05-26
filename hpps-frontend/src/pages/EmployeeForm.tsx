// src/pages/EmployeeForm.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; 

export default function EmployeeForm() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("hanh-chinh");

    // ==========================================
    // 1. STATE QUẢN LÝ DỮ LIỆU NHẬP LIỆU (ALL TABS)
    // ==========================================
    const [formData, setFormData] = useState({
        // TAB 1
        EmployeeCode: "", FullName: "", Gender: "Nam", DOB: "", CCCD: "", IssueDate: "", IssuePlace: "", Phone: "", Email: "", Ethnicity: "", Religion: "", ProvinceID: "", WardID: "", AddressDetail: "",
        // TAB 2
        Qualification: "Đại học", DepartmentID: "", PositionID: "", ValidFrom: "", ValidTo: "",
        // TAB 3: CHỨNG CHỈ & ĐẢNG
        CCHN_Number: "", CCHN_IssueDate: "", CCHN_ExpDate: "", PartyJoinDate: "",
        // TAB 4: TIỀN LƯƠNG
        JobTitleID: "", GradeID: "", StepID: "", Coefficient: 0 // Hệ số hiển thị thêm
    });

    // ==========================================
    // 2. STATE DANH MỤC (MASTER DATA)
    // ==========================================
    const [provinces, setProvinces] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [positions, setPositions] = useState<any[]>([]);
    
    // Master Data cho Tab Lương
    const [jobTitles, setJobTitles] = useState<any[]>([]);
    const [salaryGrades, setSalaryGrades] = useState<any[]>([]);
    const [salarySteps, setSalarySteps] = useState<any[]>([]);
    const [filteredSteps, setFilteredSteps] = useState<any[]>([]); // Các bậc lương sau khi lọc theo Ngạch

    useEffect(() => {
        const parseData = (res: any) => res.data?.data || (Array.isArray(res.data) ? res.data : []);

        api.get("/provinces").then(res => setProvinces(parseData(res))).catch(console.error);
        api.get("/departments").then(res => setDepartments(parseData(res))).catch(console.error);
        api.get("/positions").then(res => setPositions(parseData(res))).catch(console.error);
        
        // Tải danh mục Tiền lương
        api.get("/job-titles").then(res => setJobTitles(parseData(res))).catch(console.error);
        api.get("/salary-grades").then(res => setSalaryGrades(parseData(res))).catch(console.error);
        api.get("/salary-steps").then(res => setSalarySteps(parseData(res))).catch(console.error);
    }, []);

    // Xử lý Cascading Địa chỉ
    const handleProvinceChange = async (provinceId: string) => {
        setFormData({ ...formData, ProvinceID: provinceId, WardID: "" });
        setWards([]); 
        if (provinceId) {
            try {
                const res = await api.get(`/provinces/${provinceId}/wards`);
                setWards(res.data?.data || (Array.isArray(res.data) ? res.data : []));
            } catch (error) { console.error("Lỗi lấy danh sách Phường/Xã:", error); }
        }
    };

    // Xử lý Cascading Tiền lương: Chức danh -> Ngạch -> Bậc
    const handleJobTitleChange = (jobTitleId: string) => {
        const selectedJob = jobTitles.find(j => (j.JobTitleID || j.id).toString() === jobTitleId);
        
        if (selectedJob) {
            const gradeId = selectedJob.GradeID;
            // Lọc ra các bậc lương thuộc Ngạch này
            const stepsForGrade = salarySteps.filter(s => s.GradeID === gradeId);
            
            setFormData({ 
                ...formData, 
                JobTitleID: jobTitleId, 
                GradeID: gradeId, 
                StepID: "", // Reset bậc lương khi đổi chức danh
                Coefficient: 0 
            });
            setFilteredSteps(stepsForGrade);
        } else {
            setFormData({ ...formData, JobTitleID: "", GradeID: "", StepID: "", Coefficient: 0 });
            setFilteredSteps([]);
        }
    };

    const handleStepChange = (stepId: string) => {
        const selectedStep = filteredSteps.find(s => (s.StepID || s.id).toString() === stepId);
        setFormData({
            ...formData,
            StepID: stepId,
            Coefficient: selectedStep ? selectedStep.Coefficient : 0
        });
    };

    const tabs = [
        { id: "hanh-chinh", name: "1. Hành chính & Địa chỉ", icon: "👤" },
        { id: "cong-tac", name: "2. Trình độ & Công tác", icon: "🏢" },
        { id: "chung-chi", name: "3. Chứng chỉ & Đảng", icon: "📜" },
        { id: "tien-luong", name: "4. Tiền lương", icon: "💰" },
    ];

    return (
        <div className="flex flex-col h-screen w-screen bg-[#F4F7FC] overflow-hidden">
            {/* HEADER KHU VỰC LÀM VIỆC */}
            <div className="bg-white px-8 py-5 border-b border-gray-200 shadow-sm flex justify-between items-center z-10">
                <div>
                    <h1 className="text-2xl font-bold text-[#1E293B]">✨ Thêm Mới Hồ Sơ Nhân Sự</h1>
                    <p className="text-sm text-gray-500 mt-1">Hệ thống Quản lý Nhân sự - Tiền lương Y tế</p>
                </div>
                <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-600 transition-colors font-medium text-sm flex items-center gap-2">
                    ✕ Đóng Form
                </button>
            </div>

            {/* THANH TABS ĐIỀU HƯỚNG */}
            <div className="bg-white px-8 border-b border-gray-200 z-10">
                <nav className="flex gap-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 text-sm font-bold flex items-center gap-2 border-b-[3px] transition-all ${
                                activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            <span>{tab.icon}</span> {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* KHÔNG GIAN NHẬP LIỆU */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 min-h-full">
                    
                    {/* GIAO DIỆN TAB 1: HÀNH CHÍNH & ĐỊA CHỈ */}
                    {activeTab === "hanh-chinh" && (
                        <div className="animate-fade-in space-y-8">
                            
                            {/* Khối I: Thông tin cơ bản */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">I. Thông tin cơ bản</h3>
                                <div className="grid grid-cols-4 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">MÃ NHÂN VIÊN <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="VD: NV001" value={formData.EmployeeCode} onChange={e => setFormData({...formData, EmployeeCode: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">HỌ VÀ TÊN <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Nhập họ và tên đầy đủ..." value={formData.FullName} onChange={e => setFormData({...formData, FullName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">GIỚI TÍNH</label>
                                        <select value={formData.Gender} onChange={e => setFormData({...formData, Gender: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none">
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NGÀY SINH</label>
                                        <input type="date" value={formData.DOB} onChange={e => setFormData({...formData, DOB: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">SỐ ĐIỆN THOẠI</label>
                                        <input type="text" placeholder="Số điện thoại" value={formData.Phone} onChange={e => setFormData({...formData, Phone: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">ĐỊA CHỈ EMAIL</label>
                                        <input type="email" placeholder="VD: bacsi@benhvien.vn" value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Khối II: Thông tin định danh */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">II. Thông tin định danh</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">SỐ CCCD <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Nhập số căn cước..." value={formData.CCCD} onChange={e => setFormData({...formData, CCCD: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NGÀY CẤP</label>
                                        <input type="date" value={formData.IssueDate} onChange={e => setFormData({...formData, IssueDate: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NƠI CẤP</label>
                                        <input type="text" placeholder="VD: Cục Cảnh sát QLHC..." value={formData.IssuePlace} onChange={e => setFormData({...formData, IssuePlace: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">DÂN TỘC</label>
                                        <input type="text" placeholder="VD: Kinh" value={formData.Ethnicity} onChange={e => setFormData({...formData, Ethnicity: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">TÔN GIÁO</label>
                                        <input type="text" placeholder="VD: Không" value={formData.Religion} onChange={e => setFormData({...formData, Religion: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Khối III: Địa chỉ thường trú */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">III. Địa chỉ thường trú</h3>
                                <div className="grid grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">TỈNH / THÀNH PHỐ</label>
                                        <select value={formData.ProvinceID} onChange={e => handleProvinceChange(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none transition-all">
                                            <option value="">-- Chọn Tỉnh / Thành phố --</option>
                                            {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">PHƯỜNG / XÃ (LỌC TRỰC TIẾP THEO TỈNH)</label>
                                        <select value={formData.WardID} onChange={e => setFormData({...formData, WardID: e.target.value})} disabled={!formData.ProvinceID} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none disabled:opacity-50 transition-all">
                                            <option value="">-- Chọn Phường / Xã --</option>
                                            {wards.map(w => <option key={w.WardID} value={w.WardID}>{w.WardName}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">SỐ NHÀ, TÊN THÔN/XÓM/ĐƯỜNG (CHI TIẾT)</label>
                                    <input type="text" placeholder="VD: Số nhà 45, Thôn Thượng..." value={formData.AddressDetail} onChange={e => setFormData({...formData, AddressDetail: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* GIAO DIỆN TAB 2: TRÌNH ĐỘ & CÔNG TÁC (MỚI BỔ SUNG)       */}
                    {/* ========================================================= */}
                    {activeTab === "cong-tac" && (
                        <div className="animate-fade-in space-y-8">
                            
                            {/* Khối I: Trình độ chuyên môn */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">I. Trình độ chuyên môn</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">TRÌNH ĐỘ HỌC VẤN / CHUYÊN MÔN</label>
                                        <select value={formData.Qualification} onChange={e => setFormData({...formData, Qualification: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none">
                                            <option value="Sơ cấp">Sơ cấp</option>
                                            <option value="Trung cấp">Trung cấp</option>
                                            <option value="Cao đẳng">Cao đẳng</option>
                                            <option value="Đại học">Đại học</option>
                                            <option value="Thạc sĩ">Thạc sĩ / CKI</option>
                                            <option value="Tiến sĩ">Tiến sĩ / CKII</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Khối II: Vị trí công tác & Thời gian hiệu lực */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">II. Thông tin phân công công tác</h3>
                                <div className="grid grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">KHOA / PHÒNG BAN <span className="text-red-500">*</span></label>
                                        <select value={formData.DepartmentID} onChange={e => setFormData({...formData, DepartmentID: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none">
                                            <option value="">-- Chọn Khoa / Phòng Ban --</option>
                                            {departments.map(d => (
                                                <option key={d.DepartmentID || d.id} value={d.DepartmentID || d.id}>
                                                    {d.DepartmentName || d.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">CHỨC VỤ QUẢN LÝ</label>
                                        <select value={formData.PositionID} onChange={e => setFormData({...formData, PositionID: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none">
                                            <option value="">-- Không có chức vụ (Nhân viên) --</option>
                                            {positions.map(p => (
                                                <option key={p.PositionID || p.id} value={p.PositionID || p.id}>
                                                    {p.PositionName || p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Khối ghi nhận mốc thời gian (Rất quan trọng cho việc Tính lương) */}
                                <div className="grid grid-cols-2 gap-6 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <div>
                                        <label className="block text-xs font-bold text-blue-800 mb-2">NGÀY BẮT ĐẦU (VALID FROM) <span className="text-red-500">*</span></label>
                                        <input type="date" value={formData.ValidFrom} onChange={e => setFormData({...formData, ValidFrom: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none" />
                                        <p className="text-[10px] font-medium text-blue-600 mt-1">Hệ thống dùng mốc này để bắt đầu tính Lương/Phụ cấp khoa.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-blue-800 mb-2">NGÀY KẾT THÚC (VALID TO)</label>
                                        <input type="date" value={formData.ValidTo} onChange={e => setFormData({...formData, ValidTo: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none" />
                                        <p className="text-[10px] font-medium text-blue-600 mt-1">Bỏ trống nếu đang đương nhiệm. Điền khi luân chuyển khoa.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* TAB 3: CHỨNG CHỈ & ĐẢNG                                   */}
                    {/* ========================================================= */}
                    {activeTab === "chung-chi" && (
                        <div className="animate-fade-in space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">I. Chứng chỉ hành nghề (CCHN)</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">SỐ CHỨNG CHỈ HÀNH NGHỀ</label>
                                        <input type="text" placeholder="VD: 001234/BYT-CCHN" value={formData.CCHN_Number} onChange={e => setFormData({...formData, CCHN_Number: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NGÀY CẤP</label>
                                        <input type="date" value={formData.CCHN_IssueDate} onChange={e => setFormData({...formData, CCHN_IssueDate: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-orange-600 mb-2">NGÀY HẾT HẠN (DÙNG ĐỂ CẢNH BÁO)</label>
                                        <input type="date" value={formData.CCHN_ExpDate} onChange={e => setFormData({...formData, CCHN_ExpDate: e.target.value})} className="w-full px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">II. Sinh hoạt Đảng</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NGÀY VÀO ĐẢNG</label>
                                        <input type="date" value={formData.PartyJoinDate} onChange={e => setFormData({...formData, PartyJoinDate: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* TAB 4: TIỀN LƯƠNG & NGẠCH BẬC                             */}
                    {/* ========================================================= */}
                    {activeTab === "tien-luong" && (
                        <div className="animate-fade-in space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">Thiết lập Ngạch & Bậc lương</h3>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    {/* 1. Chọn Chức danh nghề nghiệp */}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">CHỨC DANH NGHỀ NGHIỆP <span className="text-red-500">*</span></label>
                                        <select value={formData.JobTitleID} onChange={e => handleJobTitleChange(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none">
                                            <option value="">-- Chọn Chức danh nghề nghiệp --</option>
                                            {jobTitles.map(j => (
                                                <option key={j.JobTitleID || j.id} value={j.JobTitleID || j.id}>{j.JobTitleName || j.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. Ngạch lương (Tự động) */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NGẠCH LƯƠNG TƯƠNG ỨNG</label>
                                        <select value={formData.GradeID} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-none opacity-80 font-semibold text-blue-800">
                                            <option value="">{formData.JobTitleID ? "Chưa cấu hình ngạch" : "-- Hệ thống tự động xác định --"}</option>
                                            {salaryGrades.map(g => (
                                                <option key={g.GradeID || g.id} value={g.GradeID || g.id}>{g.GradeCode} - {g.GradeName || g.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 3. Bậc lương (Lọc theo Ngạch) */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">BẬC LƯƠNG HIỆN HƯỞNG <span className="text-red-500">*</span></label>
                                        <select value={formData.StepID} onChange={e => handleStepChange(e.target.value)} disabled={!formData.GradeID} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none disabled:opacity-50">
                                            <option value="">-- Chọn Bậc lương --</option>
                                            {filteredSteps.map(s => (
                                                <option key={s.StepID || s.id} value={s.StepID || s.id}>{s.StepName || s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Hiển thị thông số hệ số lương (Chỉ đọc) */}
                                <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-800">Hệ số lương cơ bản</h4>
                                        <p className="text-xs text-emerald-600 mt-1">Dùng để làm căn cứ nhân với mức lương cơ sở.</p>
                                    </div>
                                    <div className="text-3xl font-black text-emerald-600">
                                        {formData.Coefficient > 0 ? formData.Coefficient.toFixed(2) : "0.00"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>           

            {/* STICKY FOOTER */}
            <div className="bg-white px-8 py-4 border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] flex justify-end gap-4 z-20">
                <button onClick={() => navigate("/")} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy bỏ</button>
                <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">💾 Lưu Nháp</button>
                <button className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">🚀 Lưu Chính Thức</button>
            </div>
        </div>
    );
}