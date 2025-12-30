import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProductThunk } from "../../store/thunks/productThunks";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { getAllCategories } from "../../services/productService";

// Schema Validation
const schema = yup
  .object({
    name: yup.string().required("Product Name is required"),
    price: yup
      .number()
      .typeError("Price must be a number")
      .required("Price is required"),
    description: yup.string().required("Description is required"),
    stock: yup
      .number()
      .typeError("Stock must be a number")
      .required("Stock is required"),
    categoryId: yup
      .number()
      .typeError("Category ID must be a number")
      .required("Category ID is required"),
    // Image validation (check if file list has length)
    image: yup
      .mixed()
      .test("required", "Product image is required", (value) => {
        return value && value.length > 0;
      }),
  })
  .required();

const VendorAddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.products);
  const [categories, setCategories] = useState([]); // 👈 State for categories

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // 👇 Fetch Categories on Load
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

  const onSubmit = async (data) => {
    // 1. Create FormData object for file upload
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", data.price);
    formData.append("description", data.description);
    formData.append("stock", data.stock);
    formData.append("categoryId", data.categoryId);
    // Append the file (data.image is a FileList)
    formData.append("image", data.image[0]);

    // 2. Dispatch
    const resultAction = await dispatch(createProductThunk(formData));

    if (createProductThunk.fulfilled.match(resultAction)) {
      navigate("/vendor/products");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            {...register("name")}
            className="w-full border border-gray-300 rounded-lg p-2.5"
            placeholder="e.g. Wireless Headphones"
          />
          <p className="text-red-500 text-xs mt-1">{errors.name?.message}</p>
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              {...register("price")}
              type="number"
              className="w-full border border-gray-300 rounded-lg p-2.5"
            />
            <p className="text-red-500 text-xs mt-1">{errors.price?.message}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <input
              {...register("stock")}
              type="number"
              className="w-full border border-gray-300 rounded-lg p-2.5"
            />
            <p className="text-red-500 text-xs mt-1">{errors.stock?.message}</p>
          </div>
        </div>

        {/* 👇 UPDATED: Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            {...register("categoryId")}
            className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="text-red-500 text-xs mt-1">
            {errors.categoryId?.message}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            rows="4"
            className="w-full border border-gray-300 rounded-lg p-2.5"
          ></textarea>
          <p className="text-red-500 text-xs mt-1">
            {errors.description?.message}
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          <input
            {...register("image")}
            type="file"
            accept="image/*"
            className="w-full border border-gray-300 rounded-lg p-2"
          />
          <p className="text-red-500 text-xs mt-1">{errors.image?.message}</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Creating Product..." : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default VendorAddProduct;
