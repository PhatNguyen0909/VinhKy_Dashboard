



import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dasboard/Dashboard';
import Report from './pages/Reports/Report';
import Sidebar from './components/SideBar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import './index.css';




function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<Report />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
