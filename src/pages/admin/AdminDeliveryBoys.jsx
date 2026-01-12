import { useEffect, useState } from "react";
import {
  FaTrash,
  FaPlus,
  FaUserSecret,
  FaBoxOpen,
  FaEdit,
  FaSave,
  FaTimes,
  FaEnvelope, // Added icon
  FaEye, // 🟢 Add this
  FaEyeSlash, // 🟢 Add this
} from "react-icons/fa";
import {
  getAllDeliveryBoys,
  addDeliveryBoy,
  deleteDeliveryBoy,
  updateDeliveryBoy,
} from "../../services/orderService";

const AdminDeliveryBoys = () => {
  const [boys, setBoys] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Add Form State ---
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState(""); // 🟢 NEW
  const [newPassword, setNewPassword] = useState(""); // 🟢 NEW
  const [showPassword, setShowPassword] = useState(false); // 🟢 Add this
  const [city, setCity] = useState("Raipur");
  const [state, setState] = useState("Chhattisgarh");
  const [maxOrders, setMaxOrders] = useState(20);
  const [assignedAreas, setAssignedAreas] = useState("");

  // --- Edit State ---
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState(true);
  const [editMaxOrders, setEditMaxOrders] = useState(20);
  const [editAssignedAreas, setEditAssignedAreas] = useState("");

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
    if (!/^\d{10}$/.test(newPhone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    const areaArray = assignedAreas
      .split(",")
      .map((area) => area.trim())
      .filter((area) => area !== "");

    const payload = {
      name: newName,
      phone: newPhone,
      email: newEmail, // 🟢 Include Email
      password: newPassword, // 🟢 Include Password
      city,
      state,
      maxOrders: parseInt(maxOrders),
      assignedAreas: areaArray,
    };

    try {
      const addedBoy = await addDeliveryBoy(payload);
      setBoys([...boys, addedBoy]);

      // Reset Form
      setNewName("");
      setNewPhone("");
      setNewEmail(""); // 🟢 Reset
      setNewPassword(""); // 🟢 Reset
      setAssignedAreas("");
      setMaxOrders(20);
      alert("Delivery Partner Registered Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to add delivery boy. Check if Email/Phone already exists.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteDeliveryBoy(id);
      setBoys(boys.filter((b) => b.id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  const handleEdit = (boy) => {
    setEditingId(boy.id);
    setEditStatus(boy.active ?? true);
    setEditMaxOrders(boy.maxOrders);
    setEditAssignedAreas(boy.assignedAreas ? boy.assignedAreas.join(", ") : "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    try {
      const areaArray = editAssignedAreas
        .split(",")
        .map((area) => area.trim())
        .filter((area) => area !== "");

      await updateDeliveryBoy(id, {
        active: editStatus,
        maxOrders: parseInt(editMaxOrders),
        assignedAreas: areaArray,
      });

      setBoys(
        boys.map((b) =>
          b.id === id
            ? {
                ...b,
                active: editStatus,
                maxOrders: parseInt(editMaxOrders),
                assignedAreas: areaArray,
              }
            : b
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update delivery boy");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaUserSecret /> Delivery Boys Management
      </h2>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="font-semibold text-lg mb-4 text-gray-700 border-b pb-2">
          Register New Delivery Partner
        </h3>
        <form
          onSubmit={handleAdd}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Name
            </label>
            <input
              type="text"
              placeholder="Name"
              required
              className="w-full border p-2 rounded mt-1"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          {/* Email (NEW) */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email"
              required
              className="w-full border p-2 rounded mt-1"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>

          {/* Password (NEW) */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"} // 🟢 Toggles type
                required
                className="w-full border p-2 rounded pr-10" // 🟢 Added pr-10 for space
                placeholder="Create a password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Phone
            </label>
            <input
              type="text"
              placeholder="Phone"
              required
              maxLength="10"
              pattern="\d{10}"
              className="w-full border p-2 rounded mt-1"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              City
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded mt-1 bg-gray-100 cursor-not-allowed"
              value={city}
              disabled
            />
          </div>

          {/* Max Orders */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Max Daily Orders
            </label>
            <input
              type="number"
              min="1"
              className="w-full border p-2 rounded mt-1"
              value={maxOrders}
              onChange={(e) => setMaxOrders(e.target.value)}
            />
          </div>

          {/* Areas */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-600">
              Assigned Areas (Comma Separated)
            </label>
            <textarea
              className="w-full border p-2 rounded mt-1"
              rows="2"
              placeholder="e.g. Vijay Nagar, Palasia..."
              value={assignedAreas}
              onChange={(e) => setAssignedAreas(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow flex items-center gap-2 cursor-pointer"
            >
              <FaPlus /> Register Delivery Boy
            </button>
          </div>
        </form>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
            <tr>
              <th className="p-4 border-b">Details</th>
              {/* Ensure there is no {" "} or text here */}
              <th className="p-4 border-b">Contact</th>
              {/* Ensure there is no {" "} or text here */}
              <th className="p-4 border-b w-1/3">Coverage Areas</th>
              <th className="p-4 border-b text-center">Status</th>
              <th className="p-4 border-b text-center">Capacity</th>
              <th className="p-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {boys.map((boy) => (
              <tr key={boy.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-gray-800">{boy.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    {boy.email}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  <div>{boy.phone}</div>
                  <div className="text-xs text-gray-400">
                    {boy.city}, {boy.state}
                  </div>
                </td>

                <td className="p-4">
                  {editingId === boy.id ? (
                    <textarea
                      value={editAssignedAreas}
                      onChange={(e) => setEditAssignedAreas(e.target.value)}
                      className="w-full border rounded p-1 text-sm h-16"
                      placeholder="Separate with commas..."
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {boy.assignedAreas && boy.assignedAreas.length > 0 ? (
                        boy.assignedAreas.map((area, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {area}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm italic">
                          No specific areas
                        </span>
                      )}
                    </div>
                  )}
                </td>

                <td className="p-4 text-center">
                  {editingId === boy.id ? (
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value === "true")}
                      className="border rounded px-2 py-1 text-sm bg-white"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        boy.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {boy.active ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>

                <td className="p-4 text-center">
                  {editingId === boy.id ? (
                    <input
                      type="number"
                      min="1"
                      value={editMaxOrders}
                      onChange={(e) => setEditMaxOrders(e.target.value)}
                      className="w-20 border rounded px-2 py-1 text-center"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <FaBoxOpen className="text-gray-400" />
                      <span className="font-semibold">{boy.maxOrders}</span>
                    </div>
                  )}
                </td>

                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {editingId === boy.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(boy.id)}
                          className="text-green-600 hover:text-green-700 p-2 rounded-full hover:bg-green-50"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(boy)}
                          className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 cursor-pointer"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(boy.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 cursor-pointer"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {boys.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  <FaUserSecret className="mx-auto text-4xl mb-2 text-gray-300" />
                  <p>No delivery partners registered yet.</p>
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
