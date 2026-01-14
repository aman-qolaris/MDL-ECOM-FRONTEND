import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCurrentProduct } from "../store/slices/productSlice";
import { getProduct, getFeaturedProducts } from "../store/thunks/productThunks";
import { selectFeaturedProducts } from "../store/slices/productSlice";
import { dummyProducts } from "../data/dummyData";
import {
  FaShoppingCart,
  FaArrowLeft,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { addItemToCart, getCartItems } from "../store/thunks/cartThunks";
import api from "../services/api"; // Import API for local fetching
import ProductCard from "../components/common/ProductCard"; // Reusable Card Component

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Redux State ---
  const { currentProduct, loading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const featuredProducts = useSelector(selectFeaturedProducts);

  // --- Local State ---
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Lists for bottom sections
  const [relatedProducts, setRelatedProducts] = useState([]); // Same Category
  const [similarProducts, setSimilarProducts] = useState([]); // Same Name/Keywords
  const [trendingProducts, setTrendingProducts] = useState([]); // Trending/High Price

  // 1. Fetch Main Product & Featured on Mount/ID Change
  useEffect(() => {
    dispatch(getProduct(id));
    dispatch(getFeaturedProducts());

    // Reset local state
    setRelatedProducts([]);
    setSimilarProducts([]);
    setTrendingProducts([]);
    setCurrentImageIndex(0);
    setQuantity(1);

    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  const product =
    currentProduct || dummyProducts.find((p) => p.id === parseInt(id));

  // 2. Fetch Side Lists (Related, Similar, Trending)
  useEffect(() => {
    if (product) {
      const fetchSideLists = async () => {
        try {
          // A. Category Related
          const categoryName = product.Category?.name || product.category?.name;
          if (categoryName) {
            const relatedRes = await api.get(
              `/products?category=${categoryName}`
            );
            // ✅ FIX: STRICTLY FILTER to ensure category matches exactly
            const filteredRelated = relatedRes.data
              .filter((p) => p.id !== product.id) // Exclude current product
              .filter((p) => {
                // Check if the fetched product's category matches the current product's category
                const pCat = p.Category?.name || p.category?.name;
                return pCat === categoryName;
              })
              .slice(0, 4);
            setRelatedProducts(filteredRelated);
          }

          // B. Name Related (Similar)
          // Use the first 2 words of the name as a search term
          const searchTerm = product.name.split(" ").slice(0, 2).join(" ");
          if (searchTerm) {
            const similarRes = await api.get(`/products?search=${searchTerm}`);
            const filteredSimilar = similarRes.data
              .filter((p) => p.id !== product.id)
              // Optional: Exclude if it appears in category list to avoid dupes
              .filter((p) => p.Category?.name !== categoryName)
              .slice(0, 4);
            setSimilarProducts(filteredSimilar);
          }

          // C. Trending (Simulated by Price High for now)
          const trendingRes = await api.get(`/products?sort=price_high`);
          const filteredTrending = trendingRes.data
            .filter((p) => p.id !== product.id)
            .slice(0, 4);
          setTrendingProducts(filteredTrending);
        } catch (error) {
          console.error("Error fetching related/trending:", error);
        }
      };

      fetchSideLists();

      // Update Recently Viewed
      try {
        const existing =
          JSON.parse(localStorage.getItem("recentlyViewed")) || [];
        const filtered = existing.filter((item) => item.id !== product.id);
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.imageUrl || product.image,
        };
        const updatedList = [newItem, ...filtered].slice(0, 8);
        localStorage.setItem("recentlyViewed", JSON.stringify(updatedList));
      } catch (err) {
        console.error("Failed to save recent view:", err);
      }
    }
  }, [product]);

  if (loading)
    return <div className="text-center py-20 text-xl">Loading...</div>;
  if (!product)
    return (
      <div className="text-center py-20 text-red-500">Product not found.</div>
    );

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    const existingItem = cartItems.find(
      (item) => item.productId === product.id
    );
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart + quantity > product.availableStock) {
      alert(
        `Stock Limit Reached! You already have ${currentQtyInCart} in cart. Only ${product.availableStock} available.`
      );
      return;
    }

    if (quantity > 0) {
      await dispatch(
        addItemToCart({ productId: product.id, quantity })
      ).unwrap();
      await dispatch(getCartItems()).unwrap();
      alert(`${product.name} added to cart!`);
    }
  };

  // Helper for Section Titles
  const SectionHeader = ({ title }) => (
    <div className="flex items-center justify-between mb-8 mt-16 border-b pb-4 border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Back Button */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition"
      >
        <FaArrowLeft /> Back to Shop
      </Link>

      {/* --- 1. MAIN PRODUCT DETAILS --- */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col items-center justify-center">
            {(() => {
              const images =
                product?.images?.length > 0
                  ? product.images
                  : [product.imageUrl || "https://via.placeholder.com/400"];

              return (
                <div className="w-full h-full flex flex-col gap-4">
                  <div className="relative w-full h-[400px] flex items-center justify-center group overflow-hidden">
                    <img
                      src={images[currentImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 transition-transform duration-500 hover:scale-105 mix-blend-multiply"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev === 0 ? images.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-0 p-2 bg-white/80 rounded-full shadow hover:bg-white text-gray-700 hover:text-blue-600 transition opacity-0 group-hover:opacity-100"
                        >
                          <FaChevronLeft size={20} />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev === images.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="absolute right-0 p-2 bg-white/80 rounded-full shadow hover:bg-white text-gray-700 hover:text-blue-600 transition opacity-0 group-hover:opacity-100"
                        >
                          <FaChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${
                            currentImageIndex === index
                              ? "border-blue-600 ring-2 ring-blue-100"
                              : "border-gray-300 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Thumb ${index}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Info Section */}
          <div className="p-10 flex flex-col justify-between">
            <div>
              <span className="inline-block mb-3 bg-blue-50 text-blue-700 text-xs px-4 py-1 rounded-full uppercase font-semibold tracking-wide">
                {product.Category?.name || product.category?.name || "General"}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
                <span className="text-sm text-gray-500 ml-2">(4.8)</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                {product.description || "No description available."}
              </p>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-bold text-blue-600">
                  ₹{product.price}
                </span>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    product.availableStock > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {product.availableStock > 0
                    ? `In Stock (${product.availableStock})`
                    : "Out of Stock"}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {product.availableStock > 0 && (
                <div className="flex items-center justify-between mb-6">
                  <span className="font-medium text-gray-700">Quantity</span>

                  <div className="flex items-center rounded-xl border border-gray-300 overflow-hidden">
                    <button
                      className="px-4 py-2 text-lg hover:bg-gray-100 transition"
                      onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                    >
                      −
                    </button>
                    <span className="px-6 font-semibold">{quantity}</span>
                    <button
                      className="px-4 py-2 text-lg hover:bg-gray-100 transition"
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(product.availableStock, q + 1)
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={quantity === 0 || product.availableStock === 0}
                className={`w-full py-4 rounded-xl text-lg font-bold transition flex items-center justify-center gap-3 shadow-lg ${
                  quantity === 0 || product.availableStock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl"
                }`}
              >
                <FaShoppingCart />
                {product.availableStock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. RELATED PRODUCTS (Same Category) --- */}
      {relatedProducts.length > 0 && (
        <section className="animate-fade-in-up">
          <SectionHeader title="Related Products" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* --- 3. SIMILAR PRODUCTS (Name Based) --- */}
      {similarProducts.length > 0 && (
        <section className="animate-fade-in-up delay-75">
          {/* Dynamic title based on the first word of the product name */}
          <SectionHeader title={`More like "${product.name.split(" ")[0]}"`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* --- 4. TRENDING PRODUCTS --- */}
      {trendingProducts.length > 0 && (
        <section className="animate-fade-in-up delay-100">
          <SectionHeader title="Trending Now" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* --- 5. FEATURED COLLECTION --- */}
      {featuredProducts.length > 0 && (
        <section className="animate-fade-in-up delay-200">
          <SectionHeader title="Featured Collection" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
