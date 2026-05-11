import { useEffect, useState } from "react";
import { FaArrowLeft, FaUserSecret } from "react-icons/fa";
import { getAllDeliveryBoys } from "../../services/orderService";
import DeliveryBoyForm from "../../components/admin/delivery/DeliveryBoyForm";
import DeliveryBoyTable from "../../components/admin/delivery/DeliveryBoyTable";
import { useNavigate } from "react-router-dom";

const AdminDeliveryBoys = () => {
  const navigate = useNavigate();
  const [boys, setBoys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoys();
  }, []);

  const fetchBoys = async () => {
    try {
      const data = await getAllDeliveryBoys();
      setBoys(data);
    } catch (error) {
      console.error("Failed to fetch delivery boys:", error);
      globalThis.alert("Failed to fetch delivery boys");
    } finally {
      setLoading(false);
    }
  };

  const handleBoyAdded = (newBoy) => {
    setBoys((prevBoys) => [...prevBoys, newBoy]);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <FaArrowLeft size={16} />
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaUserSecret /> Delivery Boys Management
        </h2>
      </div>

      {/* Add Form Component */}
      <DeliveryBoyForm onBoyAdded={handleBoyAdded} />

      {/* List Table Component */}
      <DeliveryBoyTable boys={boys} setBoys={setBoys} />
    </div>
  );
};

export default AdminDeliveryBoys;
