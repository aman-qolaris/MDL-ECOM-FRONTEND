import { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaUserSecret } from "react-icons/fa";
import {
  getAllDeliveryBoys,
  addDeliveryBoy,
  deleteDeliveryBoy,
} from "../../services/orderService";

const AdminDeliveryBoys = () => {
  const [boys, setBoys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

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

  const handleAdd = async (e) => {
    e.preventDefault();

    // Validate phone number is exactly 10 digits
    if (!/^\d{10}$/.test(newPhone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    try {
      const addedBoy = await addDeliveryBoy({ name: newName, phone: newPhone });
      setBoys([...boys, addedBoy]); // Update UI
      setNewName("");
      setNewPhone("");
    } catch (error) {
      alert("Failed to add delivery boy");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteDeliveryBoy(id);
      setBoys(boys.filter((b) => b.id !== id)); // Update UI
    } catch (error) {
      alert("Failed to delete");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaUserSecret /> Delivery Boys Management
      </h2>

      {/* Add Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-4">Add New Delivery Boy</h3>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            placeholder="Name"
            required
            className="border p-2 rounded w-1/3"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Phone Number (10 digits)"
            required
            maxLength="10"
            pattern="\d{10}"
            className="border p-2 rounded w-1/3"
            value={newPhone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
              setNewPhone(value);
            }}
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaPlus /> Add
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {boys.map((boy) => (
              <tr key={boy.id} className="border-t">
                <td className="p-4">#{boy.id}</td>
                <td className="p-4 font-medium">{boy.name}</td>
                <td className="p-4">{boy.phone}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDelete(boy.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {boys.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No delivery boys found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDeliveryBoys;
