import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dasboard/Dashboard';
import Report from './pages/Reports/Report';
import Revenue from './pages/Revenue/Revenue';
import Sidebar from './components/SideBar/Sidebar';
import Statistic from './pages/Statistic/Statistic';
import './index.css';




function App() {
  return (
    <Router>
      <div className="app-layout">
        <div className="main-content">
          <Sidebar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<Report />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/statistics" element={<Statistic />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;




