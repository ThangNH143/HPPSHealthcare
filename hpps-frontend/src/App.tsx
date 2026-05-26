import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeeList from "./pages/EmployeeList";
import MasterDataSettings from "./pages/MasterDataSettings";
import EmployeeForm from "./pages/EmployeeForm";

function App() {
    return (
        <BrowserRouter basename="/QLNhanSuTienLuong">
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    <Route path="/" element={<EmployeeList />} />
                    <Route path="/settings" element={<MasterDataSettings />} />
                    <Route path="/employees/new" element={<EmployeeForm />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;