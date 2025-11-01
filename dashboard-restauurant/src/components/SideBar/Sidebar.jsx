
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

// Inline SVG icons (no extra assets needed)
const IconAdd = (props) => (
	<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
		<path d="M11 11V5a1 1 0 1 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6z"/>
	</svg>
);
const IconReceipt = (props) => (
	<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
		<path d="M6 2a2 2 0 0 0-2 2v17l3-2 3 2 3-2 3 2 3-2 3 2V4a2 2 0 0 0-2-2H6zm2 5h8a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2zm0 4h8a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2zm0 4h5a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2z"/>
	</svg>
);
const IconRevenue = (props) => (
	<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
		<path d="M3 3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3zm2 14v-5h3v5H5zm5 0V7h3v10h-3zm5 0v-8h3v8h-3z"/>
	</svg>
);
const IconStats = (props) => (
	<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
		<path d="M4 19a1 1 0 0 1-1-1V6a1 1 0 1 1 2 0v11h15a1 1 0 1 1 0 2H4zm3-4a1 1 0 0 1-1-1V9a1 1 0 1 1 2 0v5a1 1 0 0 1-1 1zm5 0a1 1 0 0 1-1-1V7a1 1 0 1 1 2 0v7a1 1 0 0 1-1 1zm5 0a1 1 0 0 1-1-1v-3a1 1 0 1 1 2 0v3a1 1 0 0 1-1 1z"/>
	</svg>
);
function Sidebar() {
	return (
		<div className="sidebar">
			<NavLink to="/" className="nav-link"><IconAdd className="nav-icon" /><span className="nav-text">Enter Cost</span></NavLink>
			<NavLink to="/reports" className="nav-link"><IconReceipt className="nav-icon" /><span className="nav-text">Expenses</span></NavLink>
			<NavLink to="/revenue" className="nav-link"><IconRevenue className="nav-icon" /><span className="nav-text">Revenues</span></NavLink>
			<NavLink to="/statistics" className="nav-link"><IconStats className="nav-icon" /><span className="nav-text">Statistics</span></NavLink>
		</div>
	);
}
export default Sidebar;


