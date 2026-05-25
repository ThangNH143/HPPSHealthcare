import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeeList from "./pages/EmployeeList";
import MasterDataSettings from "./pages/MasterDataSettings";

function App() {
    return (
        <BrowserRouter basename="/QLNhanSuTienLuong">
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    <Route path="/" element={<EmployeeList />} />
                    <Route path="/settings" element={<MasterDataSettings />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;