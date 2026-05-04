import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dasboard/Dashboard';
import Report from './pages/Reports/Report';
import Revenue from './pages/Revenue/Revenue';
import Sidebar from './components/SideBar/Sidebar';
import Statistic from './pages/Statistic/Statistic';
import './index.css';




function App() {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  useEffect(() => {
    const updateOrientation = () => {
      const isMobile = window.matchMedia('(max-width: 900px)').matches;
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
      setIsMobilePortrait(isMobile && isPortrait);
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return (
    <Router>
      {isMobilePortrait ? (
        <div className="orientation-lock-screen" role="alert" aria-live="assertive">
          <div className="orientation-lock-card">
            <div className="orientation-lock-icon">📱</div>
            <h1>Vui lòng xoay ngang màn hình</h1>
            <p>Ứng dụng này chỉ hỗ trợ khi dùng điện thoại ở chế độ ngang.</p>
            <p>Xoay thiết bị sang ngang để tiếp tục sử dụng.</p>
          </div>
        </div>
      ) : (
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
      )}
    </Router>
  );
}

export default App;




