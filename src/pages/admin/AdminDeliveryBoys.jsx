import { useEffect, useState } from "react";
import { FaUserSecret } from "react-icons/fa";
import { getAllDeliveryBoys } from "../../services/orderService";
import DeliveryBoyForm from "../../components/admin/delivery/DeliveryBoyForm";
import DeliveryBoyTable from "../../components/admin/delivery/DeliveryBoyTable";

const AdminDeliveryBoys = () => {
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
      alert("Failed to fetch delivery boys");
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
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaUserSecret /> Delivery Boys Management
      </h2>

      {/* Add Form Component */}
      <DeliveryBoyForm onBoyAdded={handleBoyAdded} />

      {/* List Table Component */}
      <DeliveryBoyTable boys={boys} setBoys={setBoys} />
    </div>
  );
};

export default AdminDeliveryBoys;
