import React from 'react';
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
