
import React from 'react';
import './SideBar.css';
import { NavLink } from 'react-router-dom';

function Sidebar() {
	return (
		<aside className="sidebar">
			<h2>Sidebar</h2>
			<ul>
				<li><NavLink to="/">Dashboard</NavLink></li>
				<li><NavLink to="/reports">Báo cáo</NavLink></li>
				<li><NavLink to="/settings">Cài đặt</NavLink></li>
			</ul>
		</aside>
	);
}

export default Sidebar;
