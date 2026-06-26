// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Layout
import MainLayout from "./components/layouts/MainLayout"; 
// Pages
import EmployeeList from "./pages/EmployeeList";
import MasterDataSettings from "./pages/MasterDataSettings";
import EmployeeForm from "./pages/EmployeeForm";

function App() {
    return (
        <BrowserRouter basename="/QLNhanSuTienLuong">
            <Routes>
                {/* Bọc MainLayout cho toàn bộ các trang nghiệp vụ */}
                <Route element={<MainLayout />}>
                    
                    {/* Các trang con sẽ được render vào <Outlet /> trong MainLayout */}
                    <Route path="/" element={<EmployeeList />} />
                    <Route path="/employees" element={<EmployeeList />} />
                    
                    <Route path="/settings" element={<MasterDataSettings />} />
                    
                    <Route path="/employees/new" element={<EmployeeForm />} />
                    <Route path="/employee/edit/:id" element={<EmployeeForm />} />
                    
                    {/* (Optional) Có thể thêm trang 404 Not Found ở đây sau này */}
                    {/* <Route path="*" element={<NotFoundPage />} /> */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;