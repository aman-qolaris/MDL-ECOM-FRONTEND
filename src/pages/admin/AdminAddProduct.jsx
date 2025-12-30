import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// FIX 1: Import 'createProduct' (New Name)
import { createProduct, getAllCategories } from "../../services/productService";
import { FaArrowLeft, FaSave } from "react-icons/fa";

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]); // 👈 State for categories

  // FIX 2: State updated to match Backend Schema
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryId: "", // Backend expects ID (e.g., 1)
    description: "",
    stock: 10,
  });

  // FIX 3: Separate state for File Upload
  const [imageFile, setImageFile] = useState(null);

  // 👇 ADD THIS USE EFFECT TO FETCH CATEGORIES
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Basic validation
      if (!formData.name || !formData.price || !formData.categoryId) {
        alert("Please fill in required fields (Name, Price, Category ID)");
        setLoading(false);
        return;
      }

      // FIX 4: Use FormData to send File + Text to Backend
      const submissionData = new FormData();
      submissionData.append("name", formData.name);
      submissionData.append("price", formData.price);
      submissionData.append("categoryId", formData.categoryId);
      submissionData.append("description", formData.description);
      submissionData.append("stock", formData.stock);

      if (imageFile) {
        submissionData.append("image", imageFile); // Matches backend: upload.single("image")
      }

      // Call the service (using the new name)
      await createProduct(submissionData);

      alert("Product Added Successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      alert("Failed to add product. Ensure Category ID exists in DB.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/products")}
          className="text-gray-500 hover:text-blue-600"
        >
          <FaArrowLeft />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Wireless Headphones"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* 👇 UPDATED CATEGORY DROPDOWN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="" disabled>
              -- Select a Category --
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Product details..."
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          {loading ? (
            "Saving..."
          ) : (
            <>
              <FaSave /> Save Product
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminAddProduct;
