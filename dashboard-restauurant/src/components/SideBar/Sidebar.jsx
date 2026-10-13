import React, { useEffect, useState } from 'react';
import { API_URL } from '../../api';
import { NavLink } from 'react-router-dom';
import './SideBar.css';

const Icon = ({ type }) => {
  const paths = {
    dashboard: (
      <>
        <rect x='3' y='3' width='7' height='7' rx='1' />
        <rect x='14' y='3' width='7' height='7' rx='1' />
        <rect x='3' y='14' width='7' height='7' rx='1' />
        <rect x='14' y='14' width='7' height='7' rx='1' />
      </>
    ),
    revenue: (
      <>
        <path d='M3 17 9 11l4 4 8-9' />
        <path d='M15 6h6v6' />
      </>
    ),
    expenses: (
      <>
        <path d='M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z' />
        <path d='M14 3v5h5M8 13h8M8 17h5' />
      </>
    ),
    categories: (<><path d='M4 6h16M4 12h16M4 18h10' /></>),
    menu: (<><path d='M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2 6 0 8v10' /></>),
    orders: (<><path d='M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z' /><path d='M3 6h18M16 10a4 4 0 0 1-8 0' /></>),
  };
  return (
    <svg
      className='nav-icon'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      {paths[type]}
    </svg>
  );
};

function Sidebar() {
  const [pending, setPending] = useState(0);
  useEffect(() => {
    const load = () =>
      fetch(`${API_URL}/orders?payment_status=paid&status=new`)
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setPending(d.length))
        .catch(() => {});
    load();
    const id = setInterval(load, 10000);
    window.addEventListener('orders-updated', load);
    return () => {
      clearInterval(id);
      window.removeEventListener('orders-updated', load);
    };
  }, []);
  return (
    <aside className='sidebar'>
      <NavLink
        to='/'
        className='brand-lockup'
        aria-label='mise Restaurant Finance'
      >
        <span className='brand-mark' aria-hidden='true'>
          m
        </span>
        <span>
          <strong>Vĩnh Ký</strong>
          <small>RESTAURANT FINANCE</small>
        </span>
      </NavLink>
      <div className='sidebar-section-label'>KHÔNG GIAN LÀM VIỆC</div>
      <nav className='sidebar-nav' aria-label='Điều hướng chính'>
        <NavLink to='/' end className='nav-link'>
          <Icon type='dashboard' />
          <span>Tổng quan</span>
        </NavLink>
        <NavLink to='/expenses' className='nav-link'>
          <Icon type='expenses' />
          <span>Chi phí</span>
        </NavLink>
        <NavLink to='/revenue' className='nav-link'>
          <Icon type='revenue' />
          <span>Doanh thu</span>
        </NavLink>
      </nav>
      <div className='sidebar-section-label'>QUẢN LÝ WEBSITE</div>
      <nav className='sidebar-nav' aria-label='Quản lý website'>
        <NavLink to='/orders' className='nav-link'>
          <Icon type='orders' />
          <span>Đơn hàng</span>
          {pending > 0 && <em className='nav-badge'>{pending}</em>}
        </NavLink>
        <NavLink to='/categories' className='nav-link'>
          <Icon type='categories' />
          <span>Danh mục</span>
        </NavLink>
        <NavLink to='/menu' className='nav-link'>
          <Icon type='menu' />
          <span>Món ăn</span>
        </NavLink>
      </nav>
      <div className='sidebar-footer'>
        <span className='profile-avatar'>VK</span>
        <span className='profile-copy'>
          <strong>Quản lý nhà hàng</strong>
          <small>Tài khoản quản trị</small>
        </span>
      </div>
    </aside>
  );
}

export default Sidebar;
