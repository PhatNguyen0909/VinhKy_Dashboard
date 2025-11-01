import React, { useState, useEffect, useMemo } from 'react';
import './Dashboard.css';
import { assets } from '../../assets/assets';

function Dashboard() {
	const [entries, setEntries] = useState([]);
  const [openMonthIdx, setOpenMonthIdx] = useState(null);
	const [items, setItems] = useState([]); // all expense_items for edit
	const [editMap, setEditMap] = useState({}); // { [itemId]: { date, ha, gao, ... } }
		const [editingId, setEditingId] = useState(null); // current expanded editor row
	const today = new Date();
	const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
	const [manageMonth, setManageMonth] = useState(defaultMonth);
		const [selectedDay, setSelectedDay] = useState(''); // YYYY-MM-DD or '' for whole month

	// Field definitions for editing
	const FIELDS = [
		{ key: 'ha', label: 'Tiền Nhà' },
		{ key: 'gao', label: 'Tiền Gạo' },
		{ key: 'cho', label: 'Tiền Chợ' },
		{ key: 'kho', label: 'Tiền Khô' },
		{ key: 'gas', label: 'Tiền Gas' },
		{ key: 'dau', label: 'Tiền Dầu' },
		{ key: 'trung', label: 'Tiền Trứng' },
		{ key: 'hop', label: 'Tiền Hộp' },
		{ key: 'luong', label: 'Tiền Lương' },
		{ key: 'ga', label: 'Tiền Gà' },
		{ key: 'khac', label: 'Tiền Khác' },
	];

		const itemTotal = (obj) => {
			try {
				return FIELDS.reduce((sum, f) => sum + (Number(obj?.[f.key] || 0)), 0);
			} catch {
				return 0;
			}
		};

			// Calendar data for selected manageMonth
			const calendarWeeks = useMemo(() => {
				if (!manageMonth) return [];
				const [yStr, mStr] = manageMonth.split('-');
				const year = Number(yStr);
				const monthIndex = Number(mStr) - 1; // 0-based
				const first = new Date(year, monthIndex, 1);
				const firstWeekday = first.getDay(); // 0=Sun..6=Sat
				const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

				// previous month tail
				const days = [];
				const prevMonthDays = new Date(year, monthIndex, 0).getDate();
				for (let i = 0; i < firstWeekday; i++) {
					const dayNum = prevMonthDays - firstWeekday + 1 + i;
					const prevDate = new Date(year, monthIndex - 1, dayNum);
					const ds = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
					days.push({ inMonth: false, date: ds, day: dayNum });
				}
				// current month
				for (let d = 1; d <= daysInMonth; d++) {
					const curDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
					days.push({ inMonth: true, date: curDate, day: d });
				}
				// next month head to fill 42 cells
				while (days.length % 7 !== 0) {
					const lastCell = days[days.length - 1];
					const last = new Date(lastCell.date);
					const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
					const ds = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
					days.push({ inMonth: false, date: ds, day: next.getDate() });
				}
				// chunk into weeks
				const weeks = [];
				for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
				return weeks.slice(0, 6); // ensure max 6 rows
			}, [manageMonth]);

				// Items filtered strictly by selectedDay; if no day selected, show nothing
				const filteredItems = useMemo(() => {
					if (!selectedDay) return [];
					return (items || [])
						.filter((it) => it.date === selectedDay)
						.sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id - b.id);
				}, [items, selectedDay]);

	// Các state cho form nhập
	const [date, setDate] = useState('');
	const [tienNha, setTienNha] = useState('');
	const [tienGao, setTienGao] = useState('');
	const [tienCho, setTienCho] = useState('');
	const [tienKho, setTienKho] = useState('');
	const [tienGas, setTienGas] = useState('');
	const [tienDau, setTienDau] = useState('');
	const [tienTrung, setTienTrung] = useState('');
	const [tienHop, setTienHop] = useState('');
	const [tienLuong, setTienLuong] = useState('');
	const [tienGa, setTienGa] = useState('');
	const [tienKhac, setTienKhac] = useState('');

	const API_URL = 'http://127.0.0.1:8000/api';

	// 🔹 Lấy dữ liệu từ backend
	const loadData = async () => {
		try {
			const [expRes, itemsRes] = await Promise.all([
				fetch(`${API_URL}/expenses`),
				fetch(`${API_URL}/expense_items`),
			]);
			if (!expRes.ok) throw new Error('Không thể fetch expenses');
			if (!itemsRes.ok) throw new Error('Không thể fetch expense_items');
			const [expData, itemsData] = await Promise.all([expRes.json(), itemsRes.json()]);
			const withMonth = (expData || []).map((d) => ({ ...d, month: d.date ? d.date.slice(0, 7) : '' }));
			setEntries(withMonth);
			setItems(itemsData || []);
		} catch (err) {
			console.error('❌ Lỗi khi lấy dữ liệu:', err);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	// 🔹 Xử lý khi nhấn "Thêm"
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!date) return;

		const payload = {
			date,
			ha: parseFloat(tienNha) || 0,
			gao: parseFloat(tienGao) || 0,
			cho: parseFloat(tienCho) || 0,
			kho: parseFloat(tienKho) || 0,
			gas: parseFloat(tienGas) || 0,
			dau: parseFloat(tienDau) || 0,
			trung: parseFloat(tienTrung) || 0,
			hop: parseFloat(tienHop) || 0,
			luong: parseFloat(tienLuong) || 0,
			ga: parseFloat(tienGa) || 0,
			khac: parseFloat(tienKhac) || 0,
		};

		try {
			const resp = await fetch(`${API_URL}/expense_items`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const res = await resp.json();
			console.log('✅ Thêm thành công:', res);

			// Lấy lại danh sách mới
			await loadData();
		} catch (err) {
			console.error('❌ Lỗi khi thêm dữ liệu:', err);
		}

		// Reset form
		setDate('0');
		setTienNha('0');
		setTienGao('0');
		setTienCho('0');
		setTienKho('0');
		setTienGas('0');
		setTienDau('0');
		setTienTrung('0');
		setTienHop('0');
		setTienLuong('0');
		setTienGa('0');
		setTienKhac('0');
	};

	// 🔹 Lưu đổi ngày cho item
		const saveItem = async (item) => {
			const itemId = item.id;
			const pending = editMap[itemId] || {};
			// Build payload with only provided fields
			const payload = {};
			if (pending.date !== undefined && pending.date !== null) {
				payload.date = pending.date;
			}
			const numKeys = FIELDS.map((f) => f.key);
			for (const k of numKeys) {
				if (pending[k] !== undefined) {
					const raw = pending[k];
					// empty string => 0, else parse number
					const val = raw === '' ? 0 : Number(raw);
					payload[k] = isNaN(val) ? 0 : val;
				}
			}
			if (Object.keys(payload).length === 0) return; // nothing to update
		try {
				const resp = await fetch(`${API_URL}/expense_items/${itemId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
			});
			if (!resp.ok) throw new Error('Không thể cập nhật ngày');
			// refresh
			await loadData();
				setEditMap((prev) => ({ ...prev, [itemId]: {} }));
		} catch (err) {
				console.error('❌ Lỗi khi cập nhật item:', err);
		}
	};

	// Gom theo tháng: tổng tháng và danh sách ngày bên trong
	const monthEntries = useMemo(() => {
		const toNum = (v) => (typeof v === 'number' ? v : Number(v || 0));
		const map = {};
		(entries || []).forEach((e) => {
			const month = e.month || (e.date ? e.date.slice(0, 7) : '');
			if (!month) return;
			if (!map[month]) {
				map[month] = { month, total: 0, days: [] };
			}
			const amount = toNum(e.amount);
			map[month].total += amount;
			map[month].days.push({ date: e.date, amount });
		});

		return Object.values(map)
			.map((m) => ({
				...m,
				days: m.days.sort((a, b) => a.date.localeCompare(b.date)),
			}))
			.sort((a, b) => b.month.localeCompare(a.month));
	}, [entries]);

	const toggleOpenMonth = (idx) => {
		setOpenMonthIdx(openMonthIdx === idx ? null : idx);
	};

	const formatNumber = (n) => {
		try {
			return new Intl.NumberFormat('vi-VN').format(n || 0);
		} catch {
			return n || 0;
		}
	};

	return (
			<div className="dashboard-container">
				<div className="page-grid">
					{/* Left column: Monthly list */}
					<div className="col-left">
						<h3>📋 Danh sách chi tiêu theo tháng</h3>
						<div className="expense-list scroll-panel">
							{monthEntries.length === 0 ? (
								<p>Chưa có dữ liệu</p>
							) : (
								<ul className="expense-collapsible-list" style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
									{monthEntries.map((m, idx) => (
										<li key={m.month} className="expense-collapsible-item" style={{ marginBottom: 12 }}>
											<div
												className="expense-collapsible-header"
												onClick={() => toggleOpenMonth(idx)}
												style={{ cursor: 'pointer', fontWeight: 'bold', borderBottom: '1px solid #ccc', textAlign: 'center', padding: 8 }}
											>
												{m.month} — Tổng: {formatNumber(m.total)}
											</div>
											{openMonthIdx === idx && (
												<div className="expense-collapsible-body" style={{ paddingTop: 8 }}>
													<table style={{ maxWidth: '100%' }}>
														<thead>
															<tr>
																<th>Ngày</th>
																<th>Tổng tiền</th>
															</tr>
														</thead>
														<tbody>
															{m.days.map((d, i) => (
																<tr key={`${d.date}-${i}`}>
																	<td>{d.date}</td>
																	<td>{formatNumber(d.amount)}</td>
																</tr>
															))}
														</tbody>
														<tfoot>
															<tr>
																<td style={{ fontWeight: 600 }}>Tổng tháng</td>
																<td style={{ fontWeight: 600 }}>{formatNumber(m.total)}</td>
															</tr>
														</tfoot>
													</table>
												</div>
											)}
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					{/* Center column: Form with two-column inputs */}
					<div className="col-center">
						<h3>✏️ Nhập tiền chi mỗi ngày</h3>
						<form className="expense-form small-form">
							<div className="form-grid">
								<div className="form-field">
									<label>Ngày:</label>
									<input  type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
								</div>
								<div className="form-field">
									<label>Tiền Nhà:</label>
									<input placeholder="0" value={tienNha} onChange={(e) => setTienNha(e.target.value)} />
								</div>
								<div className="form-field">
									<label>Tiền Gạo:</label>
									<input placeholder="0" value={tienGao} onChange={(e) => setTienGao(e.target.value)} />
								</div>
								<div className="form-field">
									<label>Tiền Chợ:</label>
									<input placeholder="0" value={tienCho} onChange={(e) => setTienCho(e.target.value)} />
								</div>
								<div className="form-field">
									<label>Tiền Khô:</label>
									<input placeholder="0" value={tienKho} onChange={(e) => setTienKho(e.target.value)} />
								</div>
								<div className="form-field">
									<label>Tiền Gas:</label>
									<input placeholder="0" value={tienGas} onChange={(e) => setTienGas(e.target.value)} />
								</div>
								<div className="form-field">
									<label>Tiền Dầu:</label>
									<input placeholder="0" value={tienDau} onChange={(e) => setTienDau(e.target.value)} />
								</div>
								<div className="form-field">
									<label>Tiền Trứng:</label>
									<input placeholder="0" value={tienTrung} onChange={(e) => setTienTrung(e.target.value)} />
								</div>
								<div className="form-field">
									<label>Tiền Hộp:</label>
									<input placeholder="0" value={tienHop} onChange={(e) => setTienHop(e.target.value)} />
								</div>
								<div className="form-field">
									<label>Tiền Lương:</label>
									<input placeholder="0" value={tienLuong} onChange={(e) => setTienLuong(e.target.value)} />
								</div>
								<div className="form-field">
									<label>Tiền Gà:</label>
									<input placeholder="0" value={tienGa} onChange={(e) => setTienGa(e.target.value)} />
								</div>
								<div className="form-field">
									<label>Tiền Khác:</label>
									<input placeholder="0" value={tienKhac} onChange={(e) => setTienKhac(e.target.value)} />
								</div>
								<div className="form-actions">
									<button type="button" onClick={handleSubmit}>Thêm</button>
								</div>
							</div>
						</form>
					</div>

					{/* Right column: Calendar and day selection */}

				</div>
					<div className="calendar-section">
						<h3 className="calendar-title"><img className="title-icon" src={assets.input} alt="Chọn ngày" /> Chọn ngày để chỉnh sửa</h3>
						<div className="expense-list scroll-panel">
							<div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
								<label>Chọn tháng:</label>
								<input type="month" value={manageMonth} onChange={(e) => setManageMonth(e.target.value)} />
							</div>

							{/* Calendar picker for the selected month */}
							<div className="calendar-wrapper" style={{ marginBottom: 12 }}>
								<div className="calendar-weekdays">
									{['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((w) => (
										<div key={w} className="calendar-weekday-cell">{w}</div>
									))}
								</div>
								{calendarWeeks.map((week, wi) => (
									<div key={`w-${wi}`} className="calendar-grid">
										{week.map((d) => {
											const isSelected = selectedDay === d.date;
											return (
												<button
													className="calendar-day-btn"
													key={d.date}
													onClick={() => setSelectedDay(d.inMonth ? d.date : '')}
													style={{
														border: '1px solid ' + (isSelected ? '#1677ff' : '#e5e5e5'),
														background: isSelected ? '#e6f4ff' : '#fff',
														color: d.inMonth ? '#222' : '#aaa',
													}}
													disabled={!d.inMonth}
													title={d.date}
												>
													{d.day}
												</button>
											);
										})}
									</div>
								))}
								<div className="calendar-selected-info" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
									<span style={{ fontSize: 13, color: '#555' }}>
										Đang chọn: {selectedDay || `Cả tháng ${manageMonth}`}
									</span>
									{selectedDay && (
										<button onClick={() => setSelectedDay('')} style={{ padding: '2px 8px' }}>Bỏ chọn</button>
									)}
								</div>
							</div>
						</div>
					</div>
					{/* Bottom full-width editor section */}
					<div className="bottom-editor">
						<h3>✏️ Chỉnh sửa từng mục (expense item)</h3>
						<div className="expense-list scroll-panel">
							{!selectedDay ? (
								<p>Hãy chọn một ngày trên lịch để xem và chỉnh sửa các mục.</p>
							) : items.length === 0 ? (
								<p>Chưa có dữ liệu item</p>
							) : filteredItems.length === 0 ? (
								<p>Không có item cho ngày {selectedDay}.</p>
							) : (
								<div style={{ width: '100%', overflowX: 'auto' }}>
									<table style={{ width: '100%', minWidth: 700 }}>
										<thead>
											<tr>
												<th>ID</th>
												<th>Ngày hiện tại</th>
												<th>Đổi sang ngày</th>
												<th>Tổng</th>
												<th>Hành động</th>
											</tr>
										</thead>
										<tbody>
											{filteredItems.map((it) => (
												<>
													<tr key={`row-${it.id}`}>
														<td>{it.id}</td>
														<td>{it.date}</td>
														<td>
															<input
																type="date"
																value={(editMap[it.id]?.date ?? it.date) || ''}
																onChange={(e) => setEditMap((prev) => ({
																	...prev,
																	[it.id]: { ...(prev[it.id] || {}), date: e.target.value },
																}))}
															/>
														</td>
														<td style={{ textAlign: 'right' }}>
															{formatNumber(itemTotal({ ...it, ...(editMap[it.id] || {}) }))}
														</td>
														<td>
															{editingId === it.id ? (
																<>
																	<button onClick={() => saveItem(it)}
																		disabled={!editMap[it.id] || Object.keys(editMap[it.id]).length === 0}
																	>Lưu</button>
																	<button style={{ marginLeft: 8 }} onClick={() => {
																		setEditMap((prev) => {
																			const cp = { ...prev }; delete cp[it.id]; return cp;
																		});
																		setEditingId(null);
																	}}>Hủy</button>
																</>
															) : (
																<button onClick={() => setEditingId(it.id)}>Sửa</button>
															)}
														</td>
													</tr>
													{editingId === it.id && (
														<tr key={`editor-${it.id}`}>
															<td colSpan={5}>
																<div className="editor-grid"
																	style={{
																		display: 'grid',
																		gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
																		gap: 12,
																		padding: '12px 4px',
																		background: '#fafafa',
																		border: '1px solid #eee',
																		borderRadius: 6,
																	}}
																>
																	{FIELDS.map((f) => (
																		<label key={`${it.id}-lbl-${f.key}`} style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
																			<span style={{ marginBottom: 4 }}>{f.label}</span>
																			<input
																				type="number"
																				min="0"
																				step="1000"
																				placeholder="0"
																				value={
																				editMap[it.id]?.[f.key] !== undefined
																						? editMap[it.id]?.[f.key]
																						: it[f.key] ?? 0
																				}
																				onChange={(e) => setEditMap((prev) => ({
																					...prev,
																					[it.id]: { ...(prev[it.id] || {}), [f.key]: e.target.value },
																				}))}
																			/>
																		</label>
																	))}
																</div>
															</td>
														</tr>
												)}
											</>
										))}
									</tbody>
								</table>
								</div>
							)}
						</div>
					</div>
			</div>
	);
}

export default Dashboard;
