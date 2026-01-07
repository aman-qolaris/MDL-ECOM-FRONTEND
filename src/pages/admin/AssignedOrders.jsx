import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllDeliveryBoys } from "../../services/orderService";
import { FaTruck, FaMapMarkerAlt, FaPhone, FaEye } from "react-icons/fa";

const AssignedOrders = () => {
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
      console.error("Failed to load delivery boys", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Staff...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaTruck className="text-blue-600" /> Assigned Orders (Staff List)
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
              <th className="p-4">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Location</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {boys.map((boy) => (
              <tr key={boy.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-800">{boy.name}</td>
                <td className="p-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" /> {boy.phone}
                  </div>
                </td>
                <td className="p-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" /> {boy.city}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {boy.assignedAreas?.join(", ") || "No specific area"}
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      boy.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {boy.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <Link
                    to={`/admin/assigned-orders/${boy.id}`}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm"
                  >
                    <FaEye /> View Assignments
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {boys.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No delivery staff found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedOrders;
