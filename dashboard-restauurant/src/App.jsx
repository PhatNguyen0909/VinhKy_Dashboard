import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Expenses from './pages/Expenses/Expenses';
import Revenue from './pages/Revenue/Revenue';
import FinanceAssistant from './components/FinanceAssistant/FinanceAssistant';
import Sidebar from './components/SideBar/Sidebar';
import SplashScreen from './components/SplashScreen/SplashScreen';
import './index.css';

function App() {
  const [showSplash, setShowSplash] = useState(
    () =>
      window.matchMedia('(max-width: 760px)').matches ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
  );
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

  useEffect(() => {
    if (!showSplash) return undefined;
    const timeoutId = window.setTimeout(() => setShowSplash(false), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [showSplash]);

  return (
    <Router>
      {showSplash ? (
        <SplashScreen />
      ) : isMobilePortrait ? (
        <div
          className='orientation-lock-screen'
          role='alert'
          aria-live='assertive'
        >
          <div className='orientation-lock-card'>
            <div className='orientation-lock-icon'>📱</div>
            <h1>Vui lòng xoay ngang màn hình</h1>
            <p>Ứng dụng này chỉ hỗ trợ khi dùng điện thoại ở chế độ ngang.</p>
            <p>Xoay thiết bị sang ngang để tiếp tục sử dụng.</p>
          </div>
        </div>
      ) : (
        <div className='app-layout'>
          <div className='main-content'>
            <Sidebar />
            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='/expenses' element={<Expenses />} />
              <Route
                path='/reports'
                element={<Navigate to='/expenses' replace />}
              />
              <Route path='/statistics' element={<Navigate to='/' replace />} />
              <Route path='/revenue' element={<Revenue />} />
            </Routes>
          </div>
          <FinanceAssistant />
        </div>
      )}
    </Router>
  );
}

export default App;
