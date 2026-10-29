const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Food = require('./models/Food');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// Kết nối MongoDB Atlas
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas: 236952_TruongVanSieu'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// 1. Endpoint Health check (Kiểm tra hệ thống)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend 236952_TruongVanSieu is running smoothly' });
});

// 2. GET /api/foods (Lấy danh sách + Tìm kiếm)
app.get('/api/foods', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { name: searchRegex },
          { category: searchRegex },
          { cuisine: searchRegex }
        ]
      };
    }

    const foods = await Food.find(query).sort({ createdAt: -1 });
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

// 3. GET /api/foods/:id (Chi tiết món ăn)
app.get('/api/foods/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    res.status(200).json(food);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
  }
});

// 4. POST /api/foods (Thêm món ăn mới)
app.post('/api/foods', async (req, res) => {
  try {
    const { foodId, name, category, cuisine, ingredients, price, quantity, description, imageUrl } = req.body;

    if (!foodId || !name || !category || !cuisine || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' });
    }

    const existingFood = await Food.findOne({ foodId });
    if (existingFood) {
      return res.status(409).json({ message: 'Mã món ăn (foodId) đã tồn tại' });
    }

    const formattedIngredients = Array.isArray(ingredients) 
      ? ingredients 
      : (ingredients ? ingredients.split(',').map(item => item.trim()) : []);

    const newFood = new Food({
      foodId,
      name,
      category,
      cuisine,
      ingredients: formattedIngredients,
      price: Number(price),
      quantity: Number(quantity),
      description,
      imageUrl
    });

    const savedFood = await newFood.save();
    res.status(201).json(savedFood);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm món ăn', error: error.message });
  }
});

// 5. PUT /api/foods/:id (Cập nhật món ăn)
app.put('/api/foods/:id', async (req, res) => {
  try {
    const { foodId, name, category, cuisine, ingredients, price, quantity, description, imageUrl } = req.body;

    if (foodId) {
      const existingFood = await Food.findOne({ foodId, _id: { $ne: req.params.id } });
      if (existingFood) {
        return res.status(409).json({ message: 'Mã món ăn (foodId) đã trùng với món ăn khác' });
      }
    }

    const formattedIngredients = Array.isArray(ingredients) 
      ? ingredients 
      : (ingredients ? ingredients.split(',').map(item => item.trim()) : undefined);

    const updateData = {
      ...(foodId && { foodId }),
      ...(name && { name }),
      ...(category && { category }),
      ...(cuisine && { cuisine }),
      ...(formattedIngredients && { ingredients: formattedIngredients }),
      ...(price !== undefined && { price: Number(price) }),
      ...(quantity !== undefined && { quantity: Number(quantity) }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl })
    };

    const updatedFood = await Food.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!updatedFood) return res.status(404).json({ message: 'Không tìm thấy món ăn' });

    res.status(200).json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật món ăn', error: error.message });
  }
});

// 6. DELETE /api/foods/:id (Xóa món ăn)
app.delete('/api/foods/:id', async (req, res) => {
  try {
    const deletedFood = await Food.findByIdAndDelete(req.params.id);
    if (!deletedFood) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    res.status(200).json({ message: 'Xóa món ăn thành công', food: deletedFood });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa món ăn', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server API 236952_TruongVanSieu running on port ${PORT}`);
});