import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard() {
	const [entries, setEntries] = useState([]);

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
	useEffect(() => {
		fetch(`${API_URL}/expenses`)
			.then((r) => {
				if (!r.ok) throw new Error('Không thể fetch dữ liệu');
				return r.json();
			})
			.then((data) => {
				// ensure month field exists for table display
				const withMonth = data.map((d) => ({ ...d, month: d.date ? d.date.slice(0, 7) : '' }));
				setEntries(withMonth);
			})
			.catch((err) => console.error('❌ Lỗi khi lấy dữ liệu:', err));
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
			const list = await fetch(`${API_URL}/expenses`).then((r) => r.json());
			const withMonth = list.map((d) => ({ ...d, month: d.date ? d.date.slice(0, 7) : '' }));
			setEntries(withMonth);
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

	return (
		<div className="dashboard-container">
			<h2>Nhập tiền chi mỗi ngày</h2>

			<form className="expense-form small-form" onSubmit={handleSubmit}>
				<label>Ngày:</label>
				<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

				<label>Tiền Nhà:</label>
				<input placeholder="0" value={tienNha} onChange={(e) => setTienNha(e.target.value)} />

				<label>Tiền Gạo:</label>
				<input placeholder="0" value={tienGao} onChange={(e) => setTienGao(e.target.value)} />

				<label>Tiền Chợ:</label>
				<input placeholder="0" value={tienCho} onChange={(e) => setTienCho(e.target.value)} />

				<label>Tiền Khô:</label>
				<input placeholder="0" value={tienKho} onChange={(e) => setTienKho(e.target.value)} />

				<label>Tiền Gas:</label>
				<input placeholder="0" value={tienGas} onChange={(e) => setTienGas(e.target.value)} />

				<label>Tiền Dầu:</label>
				<input placeholder="0" value={tienDau} onChange={(e) => setTienDau(e.target.value)} />

				<label>Tiền Trứng:</label>
				<input placeholder="0" value={tienTrung} onChange={(e) => setTienTrung(e.target.value)} />

				<label>Tiền Hộp:</label>
				<input placeholder="0" value={tienHop} onChange={(e) => setTienHop(e.target.value)} />

				<label>Tiền Lương:</label>
				<input placeholder="0" value={tienLuong} onChange={(e) => setTienLuong(e.target.value)} />

				<label>Tiền Gà:</label>
				<input placeholder="0" value={tienGa} onChange={(e) => setTienGa(e.target.value)} />

				<label>Tiền Khác:</label>
				<input placeholder="0" value={tienKhac} onChange={(e) => setTienKhac(e.target.value)} />

				<button type="submit">Thêm</button>
			</form>

			<hr />
			<h3>📋 Danh sách chi tiêu</h3>
			<div className="expense-list">
				{entries.length === 0 ? (
					<p>Chưa có dữ liệu</p>
				) : (
					<table>
						<thead>
							<tr>
								<th>Ngày</th>
								<th>Tổng tiền</th>
							</tr>
						</thead>
						<tbody>
							{entries.map((entry) => (
								<tr key={entry.id}>
									<td>{entry.date}</td>
									<td>{entry.amount}</td>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr>
								<td>Tổng cộng:</td>
								<td>
									{entries.reduce((acc, entry) => acc + entry.amount, 0)}
								</td>
							</tr>
						</tfoot>
					</table>
				)}
			</div>
		</div>
	);
}

export default Dashboard;
