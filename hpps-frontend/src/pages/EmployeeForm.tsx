import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api"; 

export default function EmployeeForm() {
    const navigate = useNavigate();
    const { id } = useParams(); // Lấy ID từ URL
    const isEditMode = !!id;    // Cờ xác định đang ở chế độ Edit

    const [activeTab, setActiveTab] = useState("hanh-chinh");
    const [isUploading, setIsUploading] = useState(false);

    // ==========================================
    // 1. STATE QUẢN LÝ DỮ LIỆU NHẬP LIỆU
    // ==========================================
    const [formData, setFormData] = useState({
        // TAB 1
        EmployeeCode: "", FullName: "", Gender: "Nam", DOB: "", CCCD: "", IssueDate: "", IssuePlace: "", Phone: "", Email: "", Ethnicity: "", Religion: "", BHYT: "", BHXH: "",
        ProvinceID: "", WardID: "", AddressDetail: "", BirthPlaceProvinceID: "", 
        
        // TAB 2
        Qualification: "Đại học", DepartmentID: "", PositionID: "", 
        ValidFrom_Dept: "", ValidFrom_Pos: "", 
        DecisionURL_Dept: "", DecisionURL_Pos: "", 
        EmployeeType: "Biên chế", RecruitmentSource: "", ProbationStatus: "Chính thức", ContractURL: "",
        
        // TAB 3 & 4
        CCHN_Number: "", CCHN_IssueDate: "", CCHN_ExpDate: "", Note: "",
        PartyJoinDatePreliminary: "", PartyJoinDateOfficial: "", PartyCardNumber: "", PartyCardIssueDate: "", PartyCell: "", 
        
        // TAB 5
        JobTitleID: "", GradeID: "", StepID: "", Coefficient: 0, SalaryStartDate: ""
    });

    const [qualifications, setQualifications] = useState([
        { QualType: "Chuyên môn", QualName: "", IssuePlace: "", IssueDateText: "", AttachmentURL: "" }, 
        { QualType: "Ngoại ngữ", QualName: "", IssuePlace: "", IssueDateText: "", AttachmentURL: "" },
        { QualType: "Tin học", QualName: "", IssuePlace: "", IssueDateText: "", AttachmentURL: "" }
    ]);

    // ==========================================
    // 2. STATE DANH MỤC (MASTER DATA)
    // ==========================================
    const [provinces, setProvinces] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [positions, setPositions] = useState<any[]>([]);
    const [jobTitles, setJobTitles] = useState<any[]>([]);
    const [salaryGrades, setSalaryGrades] = useState<any[]>([]);
    const [salarySteps, setSalarySteps] = useState<any[]>([]);
    const [filteredSteps, setFilteredSteps] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // ==========================================
    // 3. EFFECT: TẢI DANH MỤC & DỮ LIỆU CŨ (NẾU EDIT)
    // ==========================================
    useEffect(() => {
        const fetchMasterData = async () => {
            const parseData = (res: any) => res.data?.data || (Array.isArray(res.data) ? res.data : []);
            try {
                const [provRes, deptRes, posRes, jobRes, gradeRes, stepRes] = await Promise.all([
                    api.get("/provinces"), api.get("/departments"), api.get("/positions"),
                    api.get("/job-titles"), api.get("/salary-grades"), api.get("/salary-steps")
                ]);
                
                setProvinces(parseData(provRes));
                setDepartments(parseData(deptRes));
                setPositions(parseData(posRes));
                setJobTitles(parseData(jobRes));
                setSalaryGrades(parseData(gradeRes));
                setSalarySteps(parseData(stepRes));
            } catch (error) {
                console.error("Lỗi tải danh mục:", error);
            }
        };

        fetchMasterData();
    }, []);

    // Hiệu ứng riêng để tải dữ liệu Employee khi sửa
    useEffect(() => {
        if (isEditMode && id) {
            const fetchEmployee = async () => {
                try {
                    const res = await api.get(`/employees/${id}`);
                    const emp = res.data.data;
                    
                    if (emp) {
                        const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : "";

                        setFormData(prev => ({
                            ...prev,
                            EmployeeCode: emp.EmployeeCode || "",
                            FullName: emp.FullName || "",
                            Gender: emp.Gender ? "Nam" : "Nữ",
                            DOB: formatDate(emp.BirthDate),
                            CCCD: emp.IdentityCardNumber || "",
                            IssueDate: formatDate(emp.IdentityCardDate),
                            IssuePlace: emp.IdentityCardPlace || "",
                            Phone: emp.PhoneNumber || "",
                            Email: emp.Email || "",
                            Ethnicity: emp.Ethnicity || "",
                            Religion: emp.Religion || "",
                            BHYT: emp.BHYT || "",
                            BHXH: emp.BHXH || "",
                            ProvinceID: emp.HometownProvinceID?.toString() || "",
                            WardID: emp.CurrentWardID?.toString() || "",
                            BirthPlaceProvinceID: emp.BirthPlaceProvinceID?.toString() || "",
                            AddressDetail: emp.HamletAddress || "",
                            
                            DepartmentID: emp.DepartmentID?.toString() || "",
                            PositionID: emp.PositionID?.toString() || "",
                            ValidFrom_Dept: emp.departments?.[0] ? formatDate(emp.departments[0].ValidFrom) : formatDate(emp.JoinDate),
                            ValidFrom_Pos: emp.positions?.[0] ? formatDate(emp.positions[0].ValidFrom) : "",
                            DecisionURL_Dept: emp.departments?.[0]?.DecisionURL || "",
                            DecisionURL_Pos: emp.positions?.[0]?.DecisionURL || "",
                            EmployeeType: emp.EmployeeType || "Biên chế",
                            RecruitmentSource: emp.RecruitmentSource || "",
                            ProbationStatus: emp.ProbationStatus || "Chính thức",
                            ContractURL: emp.ContractURL || "",

                            CCHN_Number: emp.LicenseNumber || "",
                            CCHN_IssueDate: formatDate(emp.LicenseDate),
                            CCHN_ExpDate: formatDate(emp.LicenseEndDate),
                            Note: emp.Note || "",

                            PartyJoinDatePreliminary: formatDate(emp.PartyJoinDatePreliminary),
                            PartyJoinDateOfficial: formatDate(emp.PartyJoinDateOfficial),
                            PartyCardNumber: emp.PartyCardNumber || "",
                            PartyCardIssueDate: formatDate(emp.PartyCardIssueDate),
                            PartyCell: emp.PartyCell || "",

                            JobTitleID: emp.JobTitleID?.toString() || "",
                            GradeID: emp.jobTitle?.GradeID?.toString() || "",
                            StepID: emp.SalaryStepID?.toString() || "",
                            Coefficient: emp.salaryStep?.Coefficient || 0,
                            SalaryStartDate: formatDate(emp.SalaryStartDate),
                        }));

                        // Load Xã/Phường
                        if (emp.HometownProvinceID) {
                            api.get(`/provinces/${emp.HometownProvinceID}/wards`).then(r => {
                                setWards(r.data?.data || (Array.isArray(r.data) ? r.data : []));
                            });
                        }

                        // Load Bằng cấp
                        if (emp.qualifications && emp.qualifications.length > 0) {
                            const loadedQuals = emp.qualifications.map((q: any) => ({
                                QualType: q.QualType || "Khác",
                                QualName: q.QualName || "",
                                IssuePlace: q.IssuePlace || "",
                                IssueDateText: q.IssueDateText || "",
                                AttachmentURL: q.AttachmentURL || ""
                            }));
                            while (loadedQuals.length < 3) loadedQuals.push({ QualType: "Chuyên môn", QualName: "", IssuePlace: "", IssueDateText: "", AttachmentURL: "" });
                            setQualifications(loadedQuals.slice(0, 3));
                        }
                    }
                } catch (error) {
                    console.error("Lỗi khi tải hồ sơ nhân viên:", error);
                    alert("Không thể lấy dữ liệu nhân viên!");
                }
            };
            fetchEmployee();
        }
    }, [id, isEditMode]);

    // Tự động load bậc lương khi chức danh thay đổi (cho cả lúc Load Edit và Chọn mới)
    useEffect(() => {
        if (formData.JobTitleID && jobTitles.length > 0 && salarySteps.length > 0) {
            const selectedJob = jobTitles.find(j => (j.JobTitleID || j.id).toString() === formData.JobTitleID.toString());
            if (selectedJob) {
                const stepsForGrade = salarySteps.filter(s => s.GradeID === selectedJob.GradeID);
                setFilteredSteps(stepsForGrade);
                if (!formData.GradeID) setFormData(prev => ({...prev, GradeID: selectedJob.GradeID}));
            }
        }
    }, [formData.JobTitleID, jobTitles, salarySteps]);

    // ==========================================
    // 4. HÀM XỬ LÝ SỰ KIỆN GIAO DIỆN
    // ==========================================
    const handleProvinceChange = async (provinceId: string) => {
        setFormData({ ...formData, ProvinceID: provinceId, WardID: "" });
        setWards([]); 
        if (provinceId) {
            try {
                const res = await api.get(`/provinces/${provinceId}/wards`);
                setWards(res.data?.data || (Array.isArray(res.data) ? res.data : []));
            } catch (error) { console.error("Lỗi lấy Xã:", error); }
        }
    };

    const handleJobTitleChange = (jobTitleId: string) => {
        setFormData({ ...formData, JobTitleID: jobTitleId, GradeID: "", StepID: "", Coefficient: 0 });
    };

    const handleStepChange = (stepId: string) => {
        const selectedStep = filteredSteps.find(s => (s.StepID || s.id).toString() === stepId);
        setFormData({ ...formData, StepID: stepId, Coefficient: selectedStep ? selectedStep.Coefficient : 0 });
    };

    const handleQualChange = (index: number, field: string, value: string) => {
        const newQuals = [...qualifications];
        newQuals[index] = { ...newQuals[index], [field]: value };
        setQualifications(newQuals);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const uploadData = new FormData();
        uploadData.append("file", file);
        
        try {
            setIsUploading(true);
            const res = await api.post("/upload", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
            if (res.data.success) callback(res.data.url);
        } catch (error) {
            console.error("Lỗi upload", error);
            alert("Lỗi tải file lên Server! Vui lòng thử lại.");
        } finally {
            setIsUploading(false);
        }
    };

    // ==========================================
    // 5. HÀM LƯU DỮ LIỆU (POST / PUT)
    // ==========================================
    const handleSave = async () => {
        if (!formData.EmployeeCode.trim()) return alert("Vui lòng nhập Mã nhân viên!");
        if (!formData.FullName.trim()) return alert("Vui lòng nhập Họ và Tên!");
        if (!formData.DepartmentID) return alert("Vui lòng chọn Khoa / Phòng ban công tác!");

        setIsSaving(true);
        try {
            const validQualifications = qualifications.filter(q => q.QualName.trim() !== "");

            const payload = {
                ...formData,
                BirthPlaceProvinceID: formData.BirthPlaceProvinceID ? Number(formData.BirthPlaceProvinceID) : null,
                ProvinceID: formData.ProvinceID ? Number(formData.ProvinceID) : null,
                WardID: formData.WardID ? Number(formData.WardID) : null,
                DepartmentID: formData.DepartmentID ? Number(formData.DepartmentID) : null,
                PositionID: formData.PositionID ? Number(formData.PositionID) : null,
                JobTitleID: formData.JobTitleID ? Number(formData.JobTitleID) : null,
                GradeID: formData.GradeID ? Number(formData.GradeID) : null,
                StepID: formData.StepID ? Number(formData.StepID) : null,
                PartyCardIssueDate: formData.PartyCardIssueDate,
                ContractURL: formData.ContractURL,
                DecisionURL_Dept: formData.DecisionURL_Dept,
                DecisionURL_Pos: formData.DecisionURL_Pos,
                qualifications: validQualifications 
            };

            let res;
            if (isEditMode) {
                res = await api.put(`/employees/${id}`, payload);
            } else {
                res = await api.post("/employees", payload);
            }
            
            if (res.data) {
                alert(`🎉 ${isEditMode ? "Cập nhật" : "Thêm mới"} hồ sơ nhân sự thành công!`);
                navigate("/"); 
            }
        } catch (error: any) {
            console.error("Lỗi khi lưu nhân sự:", error);
            alert("Lỗi lưu dữ liệu: " + (error.response?.data?.message || "Không thể kết nối API"));
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: "hanh-chinh", name: "1. Hành chính & Địa chỉ", icon: "👤" },
        { id: "cong-tac", name: "2. Trình độ & Công tác", icon: "🏢" },
        { id: "cchn", name: "3. Chứng chỉ hành nghề", icon: "📜" },
        { id: "dang", name: "4. Đảng", icon: "⭐" },
        { id: "tien-luong", name: "5. Tiền lương", icon: "💰" },
    ];

    return (
        <div className="flex flex-col h-screen w-screen bg-[#F4F7FC] overflow-hidden">
            {/* HEADER ĐỘNG DỰA THEO CHẾ ĐỘ */}
            <div className="bg-white px-8 py-5 border-b border-gray-200 shadow-sm flex justify-between items-center z-10">
                <div>
                    <h1 className="text-2xl font-bold text-[#1E293B]">
                        {isEditMode ? "✏️ Chỉnh Sửa Hồ Sơ Nhân Sự" : "✨ Thêm Mới Hồ Sơ Nhân Sự"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Hệ thống Quản lý Nhân sự - Tiền lương Y tế</p>
                </div>
                <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-600 transition-colors font-medium text-sm flex items-center gap-2">✕ Đóng Form</button>
            </div>

            <div className="bg-white px-8 border-b border-gray-200 z-10">
                <nav className="flex gap-8">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 text-sm font-bold flex items-center gap-2 border-b-[3px] transition-all ${activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                            <span>{tab.icon}</span> {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {isUploading && (
                <div className="bg-blue-500 text-white text-center text-xs py-1 font-bold animate-pulse">
                    ⏳ Đang tải file lên máy chủ... Vui lòng chờ!
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 min-h-full">
                    
                    {/* TAB 1: HÀNH CHÍNH & ĐỊA CHỈ */}
                    {activeTab === "hanh-chinh" && (
                        <div className="animate-fade-in space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">I. Thông tự cơ bản</h3>
                                <div className="grid grid-cols-4 gap-6">
                                    <div><label className="block text-xs font-bold text-gray-500 mb-2">MÃ NHÂN VIÊN <span className="text-red-500">*</span></label><input type="text" placeholder="VD: NV001" value={formData.EmployeeCode} onChange={e => setFormData({...formData, EmployeeCode: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" /></div>
                                    <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 mb-2">HỌ VÀ TÊN <span className="text-red-500">*</span></label><input type="text" placeholder="Nhập họ và tên đầy đủ..." value={formData.FullName} onChange={e => setFormData({...formData, FullName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 mb-2">GIỚI TÍNH</label><select value={formData.Gender} onChange={e => setFormData({...formData, Gender: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none"><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></div>
                                    
                                    <div><label className="block text-xs font-bold text-gray-500 mb-2">NGÀY SINH</label><input type="date" value={formData.DOB} onChange={e => setFormData({...formData, DOB: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" /></div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NƠI SINH (TỈNH/THÀNH)</label>
                                        <select value={formData.BirthPlaceProvinceID} onChange={e => setFormData({...formData, BirthPlaceProvinceID: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none">
                                            <option value="">-- Chọn Tỉnh nơi sinh --</option>
                                            {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
                                        </select>
                                    </div>
                                    <div><label className="block text-xs font-bold text-gray-500 mb-2">SỐ ĐIỆN THOẠI</label><input type="text" placeholder="Số điện thoại" value={formData.Phone} onChange={e => setFormData({...formData, Phone: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 mb-2">ĐỊA CHỈ EMAIL</label><input type="email" placeholder="VD: bacsi@benhvien.vn" value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" /></div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">II. Thông tin định danh & Bảo hiểm</h3>
                                <div className="grid grid-cols-4 gap-6">
                                    <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 mb-2">SỐ CCCD</label><input type="text" placeholder="Nhập số căn cước..." value={formData.CCCD} onChange={e => setFormData({...formData, CCCD: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" /></div>
                                    <div><label className="block text-xs font-bold text-blue-600 mb-2">SỐ BHYT</label><input type="text" placeholder="Mã thẻ BHYT" value={formData.BHYT} onChange={e => setFormData({...formData, BHYT: e.target.value})} className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none" /></div>
                                    <div><label className="block text-xs font-bold text-blue-600 mb-2">SỐ BHXH</label><input type="text" placeholder="Mã số BHXH" value={formData.BHXH} onChange={e => setFormData({...formData, BHXH: e.target.value})} className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none" /></div>
                                    
                                    <div><label className="block text-xs font-bold text-gray-500 mb-2">NGÀY CẤP CCCD</label><input type="date" value={formData.IssueDate} onChange={e => setFormData({...formData, IssueDate: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 mb-2">NƠI CẤP</label><input type="text" placeholder="VD: Cục Cảnh sát..." value={formData.IssuePlace} onChange={e => setFormData({...formData, IssuePlace: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 mb-2">DÂN TỘC</label><input type="text" placeholder="VD: Kinh" value={formData.Ethnicity} onChange={e => setFormData({...formData, Ethnicity: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 mb-2">TÔN GIÁO</label><input type="text" placeholder="VD: Không" value={formData.Religion} onChange={e => setFormData({...formData, Religion: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" /></div>
                                </div>
                            </div>

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
                                        <label className="block text-xs font-bold text-gray-500 mb-2">PHƯỜNG / XÃ</label>
                                        <select value={formData.WardID} onChange={e => setFormData({...formData, WardID: e.target.value})} disabled={!formData.ProvinceID} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none disabled:opacity-50 transition-all">
                                            <option value="">-- Chọn Phường / Xã --</option>
                                            {wards.map(w => <option key={w.WardID} value={w.WardID}>{w.WardName}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-2">SỐ NHÀ, TÊN THÔN/XÓM/ĐƯỜNG (CHI TIẾT)</label><input type="text" placeholder="VD: Số nhà 45, Thôn Thượng..." value={formData.AddressDetail} onChange={e => setFormData({...formData, AddressDetail: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" /></div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: TRÌNH ĐỘ & CÔNG TÁC */}
                    {activeTab === "cong-tac" && (
                        <div className="animate-fade-in space-y-8">
                            
                            {/* Khối I: Bằng cấp - CÓ UPLOAD */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">I. Bằng cấp & Chứng chỉ</h3>
                                <div className="space-y-4">
                                    {qualifications.map((qual, index) => (
                                        <div key={index} className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 items-end">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1">LOẠI BẰNG</label>
                                                <select value={qual.QualType} onChange={e => handleQualChange(index, "QualType", e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none">
                                                    <option value="Chuyên môn">Chuyên môn</option>
                                                    <option value="Ngoại ngữ">Ngoại ngữ</option>
                                                    <option value="Tin học">Tin học</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1">TÊN BẰNG</label>
                                                <input type="text" placeholder="VD: Bác sĩ..." value={qual.QualName} onChange={e => handleQualChange(index, "QualName", e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1">NƠI CẤP</label>
                                                <input type="text" value={qual.IssuePlace} onChange={e => handleQualChange(index, "IssuePlace", e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1">NGÀY CẤP</label>
                                                <input type="text" placeholder="VD: 10/2020" value={qual.IssueDateText} onChange={e => handleQualChange(index, "IssueDateText", e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1">BẢN SCAN (PDF/JPG)</label>
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, (url) => handleQualChange(index, "AttachmentURL", url))} className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                                                {qual.AttachmentURL && <span className="text-[10px] text-green-600 font-bold block mt-1">✅ Đã đính kèm</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Khối II: Phân công & Tính chất nhân sự */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">II. Phân công công tác & Tính chất nhân sự</h3>
                                <div className="grid grid-cols-4 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">LOẠI ĐỐI TƯỢNG NHÂN SỰ</label>
                                        <select value={formData.EmployeeType} onChange={e => setFormData({...formData, EmployeeType: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                                            <option value="Biên chế">Biên chế / Viên chức</option>
                                            <option value="Hợp đồng">Hợp đồng lao động</option>
                                            <option value="Thực hành sinh">Thực hành sinh / Tập sự</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">TRẠNG THÁI THỬ VIỆC</label>
                                        <select value={formData.ProbationStatus} onChange={e => setFormData({...formData, ProbationStatus: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                                            <option value="Chính thức">Chính thức</option>
                                            <option value="Tập sự">Đang tập sự / Thử việc</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NGUỒN T.DỤNG</label>
                                        <input type="text" placeholder="VD: Sở Y Tế cấp..." value={formData.RecruitmentSource} onChange={e => setFormData({...formData, RecruitmentSource: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                                    </div>
                                    
                                    <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100 flex flex-col justify-center">
                                        <label className="block text-[10px] font-bold text-orange-800 mb-1">BẢN SCAN HỢP ĐỒNG</label>
                                        <input 
                                            type="file" 
                                            accept=".pdf,.jpg,.jpeg,.png" 
                                            onChange={(e) => handleFileUpload(e, (url) => setFormData({...formData, ContractURL: url}))} 
                                            className="w-full text-[10px] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer" 
                                        />
                                        {formData.ContractURL && <span className="text-[10px] text-green-600 font-bold block mt-1">✅ Đã lưu Hợp đồng</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* CÔNG TÁC KHOA (CÓ UPLOAD) */}
                                    <div className="p-5 bg-blue-50/40 rounded-xl border border-blue-100 space-y-4">
                                        <h4 className="text-sm font-bold text-blue-900">🏢 Công tác Khoa / Phòng</h4>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2">KHOA / PHÒNG CÔNG TÁC <span className="text-red-500">*</span></label>
                                            <select value={formData.DepartmentID} onChange={e => setFormData({...formData, DepartmentID: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none">
                                                <option value="">-- Chọn Khoa / Phòng Ban --</option>
                                                {departments.map(d => <option key={d.DepartmentID || d.id} value={d.DepartmentID || d.id}>{d.DepartmentName || d.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-2">NGÀY BẮT ĐẦU</label><input type="date" value={formData.ValidFrom_Dept} onChange={e => setFormData({...formData, ValidFrom_Dept: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-gray-500 mb-2">QĐ THUYÊN CHUYỂN</label>
                                                <input type="file" accept=".pdf,.jpg" onChange={(e) => handleFileUpload(e, (url) => setFormData({...formData, DecisionURL_Dept: url}))} className="w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-blue-100 file:text-blue-700 cursor-pointer" />
                                                {formData.DecisionURL_Dept && <span className="text-[10px] text-green-600 font-bold block mt-1">✅ Đã tải file</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* BỔ NHIỆM CHỨC VỤ (CÓ UPLOAD) */}
                                    <div className="p-5 bg-purple-50/40 rounded-xl border border-purple-100 space-y-4">
                                        <h4 className="text-sm font-bold text-purple-900">👑 Bổ nhiệm Chức vụ Quản lý</h4>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2">CHỨC VỤ QUẢN LÝ</label>
                                            <select value={formData.PositionID} onChange={e => setFormData({...formData, PositionID: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none">
                                                <option value="">-- Không có chức vụ --</option>
                                                {positions.map(p => <option key={p.PositionID || p.id} value={p.PositionID || p.id}>{p.PositionName || p.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-2">NGÀY BỔ NHIỆM</label><input type="date" value={formData.ValidFrom_Pos} onChange={e => setFormData({...formData, ValidFrom_Pos: e.target.value})} disabled={!formData.PositionID} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none disabled:opacity-50" /></div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-gray-500 mb-2">QĐ BỔ NHIỆM</label>
                                                <input type="file" accept=".pdf,.jpg" disabled={!formData.PositionID} onChange={(e) => handleFileUpload(e, (url) => setFormData({...formData, DecisionURL_Pos: url}))} className="w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-purple-100 file:text-purple-700 cursor-pointer disabled:opacity-50" />
                                                {formData.DecisionURL_Pos && <span className="text-[10px] text-green-600 font-bold block mt-1">✅ Đã tải file</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: CHỨNG CHỈ HÀNH NGHỀ (CCHN) */}
                    {activeTab === "cchn" && (
                        <div className="animate-fade-in space-y-8">
                            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">Chứng chỉ hành nghề (CCHN)</h3>
                                
                                <div className="grid grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">SỐ CHỨNG CHỈ HÀNH NGHỀ</label>
                                        <input type="text" placeholder="VD: 001234/BYT-CCHN" value={formData.CCHN_Number} onChange={e => setFormData({...formData, CCHN_Number: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NGÀY CẤP CCHN</label>
                                        <input type="date" value={formData.CCHN_IssueDate} onChange={e => setFormData({...formData, CCHN_IssueDate: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-orange-600 mb-2">NGÀY HẾT HẠN CCHN (CẢNH BÁO)</label>
                                        <input type="date" value={formData.CCHN_ExpDate} onChange={e => setFormData({...formData, CCHN_ExpDate: e.target.value})} className="w-full px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-200 outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">GHI CHÚ HỒ SƠ</label>
                                    <textarea rows={3} placeholder="Ghi chú thêm về nhân sự hoặc chứng chỉ..." value={formData.Note} onChange={e => setFormData({...formData, Note: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none"></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: THÔNG TIN ĐẢNG */}
                    {activeTab === "dang" && (
                        <div className="animate-fade-in space-y-8">
                            <div className="p-6 bg-red-50/30 rounded-xl border border-red-100 shadow-sm">
                                <h3 className="text-lg font-bold text-red-800 border-b border-red-100 pb-2 mb-4">Thông tin Sinh hoạt Đảng</h3>
                                
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2">NGÀY VÀO ĐẢNG (DỰ BỊ)</label>
                                        <input type="date" value={formData.PartyJoinDatePreliminary} onChange={e => setFormData({...formData, PartyJoinDatePreliminary: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2">NGÀY VÀO ĐẢNG (CHÍNH THỨC)</label>
                                        <input type="date" value={formData.PartyJoinDateOfficial} onChange={e => setFormData({...formData, PartyJoinDateOfficial: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 outline-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2">SỐ THẺ ĐẢNG VIÊN</label>
                                        <input type="text" placeholder="Nhập số thẻ Đảng..." value={formData.PartyCardNumber} onChange={e => setFormData({...formData, PartyCardNumber: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2">NGÀY CẤP THẺ ĐẢNG</label>
                                        <input type="date" value={formData.PartyCardIssueDate} onChange={e => setFormData({...formData, PartyCardIssueDate: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2">SINH HOẠT TẠI CHI BỘ</label>
                                        <input type="text" placeholder="Nhập tên chi bộ..." value={formData.PartyCell} onChange={e => setFormData({...formData, PartyCell: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: TIỀN LƯƠNG */}
                    {activeTab === "tien-luong" && (
                        <div className="animate-fade-in space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 mb-4">Thiết lập Ngạch & Bậc lương</h3>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">CHỨC DANH NGHỀ NGHIỆP</label>
                                        <select value={formData.JobTitleID} onChange={e => handleJobTitleChange(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                                            <option value="">-- Chọn Chức danh --</option>
                                            {jobTitles.map(j => <option key={j.JobTitleID || j.id} value={j.JobTitleID || j.id}>{j.JobTitleName || j.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">NGẠCH LƯƠNG</label>
                                        <select value={formData.GradeID} disabled className="w-full px-4 py-2.5 bg-gray-100 rounded-xl outline-none font-semibold text-blue-800">
                                            <option value="">-- Tự động xác định --</option>
                                            {salaryGrades.map(g => <option key={g.GradeID || g.id} value={g.GradeID || g.id}>{g.GradeCode}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">BẬC LƯƠNG</label>
                                        <select value={formData.StepID} onChange={e => handleStepChange(e.target.value)} disabled={!formData.GradeID} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl outline-none">
                                            <option value="">-- Chọn Bậc --</option>
                                            {filteredSteps.map(s => <option key={s.StepID || s.id} value={s.StepID || s.id}>{s.StepName || s.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">MỐC HƯỞNG BẬC TỪ NGÀY <span className="text-red-500">*</span></label>
                                        <input type="date" value={formData.SalaryStartDate} onChange={e => setFormData({...formData, SalaryStartDate: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none" />
                                    </div>
                                    <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                                        <div><h4 className="text-sm font-bold text-emerald-800">Hệ số lương cơ bản</h4></div>
                                        <div className="text-3xl font-black text-emerald-600">{formData.Coefficient > 0 ? formData.Coefficient.toFixed(2) : "0.00"}</div>
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
                <button onClick={handleSave} disabled={isSaving || isUploading} className={`px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${isSaving || isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"}`}>
                    {isSaving ? "⏳ Đang lưu hồ sơ..." : (isEditMode ? "🚀 Cập Nhật Hồ Sơ" : "🚀 Lưu Chính Thức")}
                </button>
            </div>
        </div>
    );
}