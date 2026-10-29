import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    foodId: '', name: '', category: '', cuisine: '',
    ingredients: '', price: '', quantity: '', description: '', imageUrl: ''
  });

  const fetchFoods = async (searchQuery = '') => {
    setLoading(true);
    setError('');
    try {
      const url = searchQuery
        ? `${API_BASE_URL}/api/foods?search=${encodeURIComponent(searchQuery)}`
        : `${API_BASE_URL}/api/foods`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Không thể tải danh sách món ăn');
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFoods(); }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFoods(search);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      foodId: '', name: '', category: '', cuisine: '',
      ingredients: '', price: '', quantity: '', description: '', imageUrl: ''
    });
    setIsEditing(false);
    setSelectedFood(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotification('');

    const payload = {
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      ingredients: typeof formData.ingredients === 'string'
        ? formData.ingredients.split(',').map(s => s.trim()).filter(Boolean)
        : formData.ingredients
    };

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing ? `${API_BASE_URL}/api/foods/${selectedFood._id}` : `${API_BASE_URL}/api/foods`;

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Thao tác không thành công');

      setNotification(isEditing ? 'Cập nhật món ăn thành công!' : 'Thêm món ăn thành công!');
      resetForm();
      fetchFoods(search);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (food) => {
    setSelectedFood(food);
    setIsEditing(true);
    setFormData({
      foodId: food.foodId,
      name: food.name,
      category: food.category,
      cuisine: food.cuisine,
      ingredients: Array.isArray(food.ingredients) ? food.ingredients.join(', ') : food.ingredients,
      price: food.price,
      quantity: food.quantity,
      description: food.description || '',
      imageUrl: food.imageUrl || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/foods/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa món ăn thất bại');
      setNotification('Xóa món ăn thành công!');
      fetchFoods(search);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50' }}>HỆ THỐNG QUẢN LÝ MÓN ĂN</h1>
        <p style={{ color: '#7f8c8d' }}>Thực hành Điện toán đám mây - MSSV: 236952 | Trương Văn Siêu</p>
      </header>

      {notification && <div style={{ background: '#d4edda', color: '#155724', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px' }}>{notification}</div>}
      {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên món ăn, loại món hoặc vùng miền..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Tìm kiếm
        </button>
      </form>

      <form onSubmit={handleSubmit} style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#34495e' }}>{isEditing ? 'Cập Nhật Món Ăn' : 'Thêm Món Ăn Mới'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input name="foodId" placeholder="Mã món (foodId) *" value={formData.foodId} onChange={handleInputChange} disabled={isEditing} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input name="name" placeholder="Tên món ăn *" value={formData.name} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input name="category" placeholder="Loại món (Món nước, Món nướng...) *" value={formData.category} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input name="cuisine" placeholder="Vùng miền (Miền Bắc, Miền Nam...) *" value={formData.cuisine} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input name="price" type="number" placeholder="Giá bán (VNĐ) *" value={formData.price} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input name="quantity" type="number" placeholder="Số lượng hiện có *" value={formData.quantity} onChange={handleInputChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <input name="imageUrl" placeholder="Đường dẫn hình ảnh (URL)" value={formData.imageUrl} onChange={handleInputChange} style={{ width: '100%', marginTop: '12px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <input name="ingredients" placeholder="Danh sách nguyên liệu (phân cách bằng dấu phẩy)" value={formData.ingredients} onChange={handleInputChange} style={{ width: '100%', marginTop: '12px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <textarea name="description" placeholder="Mô tả món ăn" value={formData.description} onChange={handleInputChange} style={{ width: '100%', marginTop: '12px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', height: '80px' }} />
        
        <div style={{ marginTop: '15px' }}>
          <button type="submit" style={{ padding: '10px 20px', background: isEditing ? '#e67e22' : '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {isEditing ? 'Lưu Thay Đổi' : 'Thêm Món Ăn'}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} style={{ marginLeft: '10px', padding: '10px 20px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Hủy
            </button>
          )}
        </div>
      </form>

      <h3 style={{ marginBottom: '15px', color: '#34495e' }}>Danh Sách Món Ăn</h3>
      {loading ? (
        <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</p>
      ) : foods.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>Không tìm thấy món ăn nào.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {foods.map((food) => (
            <div key={food._id} style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
              {food.imageUrl ? (
                <img src={food.imageUrl} alt={food.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '160px', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Không có ảnh</div>
              )}
              <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ color: '#2c3e50', marginBottom: '5px' }}>{food.name} ({food.foodId})</h4>
                  <p style={{ fontSize: '14px', color: '#e67e22', fontWeight: 'bold', marginBottom: '8px' }}>
                    {food.price ? food.price.toLocaleString('vi-VN') : 0} VNĐ | Còn lại: {food.quantity}
                  </p>
                  <p style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '4px' }}><strong>Loại:</strong> {food.category} | <strong>Vùng:</strong> {food.cuisine}</p>
                  {food.ingredients && food.ingredients.length > 0 && (
                    <p style={{ fontSize: '12px', color: '#95a5a6', marginBottom: '8px' }}><strong>Nguyên liệu:</strong> {food.ingredients.join(', ')}</p>
                  )}
                  {food.description && <p style={{ fontSize: '13px', color: '#555', marginBottom: '10px' }}>{food.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button onClick={() => handleEdit(food)} style={{ flex: 1, padding: '6px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sửa</button>
                  <button onClick={() => handleDelete(food._id)} style={{ flex: 1, padding: '6px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
