import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProductThunk } from "../../store/thunks/productThunks";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { getAllCategories } from "../../services/productService";
import { FaTimes, FaPlus, FaCloudUploadAlt } from "react-icons/fa"; // Icons for UI

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
    // Validation checks if the array has items
    image: yup
      .mixed()
      .test("required", "At least one product image is required", (value) => {
        return value && value.length > 0;
      }),
  })
  .required();

const VendorAddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.products);
  const [categories, setCategories] = useState([]);

  // Custom State for Image Management
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const {
    register,
    handleSubmit,
    setValue, // Needed to manually update the form value
    trigger, // Needed to trigger validation manually
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

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

  // 🟢 1. Handle adding a SINGLE file via the "+" button
  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Add to local state
      const newFiles = [...selectedFiles, file];
      setSelectedFiles(newFiles);
      setPreviews([...previews, URL.createObjectURL(file)]);

      // 2. Sync with React Hook Form
      setValue("image", newFiles);
      trigger("image"); // Manually trigger validation to clear errors
    }
    // Reset input so the same file can be selected again if needed
    e.target.value = "";
  };

  // 🔴 2. Handle removing an image
  const handleRemoveImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);

    // Sync with React Hook Form
    setValue("image", newFiles);
    trigger("image");
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", data.price);
    formData.append("description", data.description);
    formData.append("stock", data.stock);
    formData.append("categoryId", data.categoryId);

    // Append all selected files
    selectedFiles.forEach((file) => {
      formData.append("images", file); // Key must be "images" for backend
    });

    const resultAction = await dispatch(createProductThunk(formData));

    if (createProductThunk.fulfilled.match(resultAction)) {
      navigate("/vendor/products");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-gray-200">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Category */}
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

        {/* 🖼️ NEW: Image Upload UI with + Sign */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images (Max 5)
          </label>

          <div className="flex flex-wrap gap-4">
            {/* 1. Render Previews of selected images */}
            {previews.map((src, index) => (
              <div
                key={index}
                className="relative w-24 h-24 border border-gray-200 rounded-lg overflow-hidden group"
              >
                <img
                  src={src}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover"
                />
                {/* Delete Button (visible on hover) */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            ))}

            {/* 2. The "+" Button (Only show if less than 5 images) */}
            {selectedFiles.length < 5 && (
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                <FaPlus className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add Photo</span>

                {/* Hidden File Input */}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAddImage}
                />
              </label>
            )}
          </div>

          {/* Error Message */}
          <p className="text-red-500 text-xs mt-2">{errors.image?.message}</p>
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
