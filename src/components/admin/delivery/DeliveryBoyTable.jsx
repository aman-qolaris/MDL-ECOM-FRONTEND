/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  FaTrash,
  FaBoxOpen,
  FaEdit,
  FaSave,
  FaTimes,
  FaUserSecret,
} from "react-icons/fa";
import {
  deleteDeliveryBoy,
  updateDeliveryBoy,
} from "../../../services/orderService";

const DeliveryBoyTable = ({ boys, setBoys }) => {
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState(true);
  const [editMaxOrders, setEditMaxOrders] = useState(20);
  const [editAssignedAreas, setEditAssignedAreas] = useState("");

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteDeliveryBoy(id);
      setBoys(boys.filter((b) => b.id !== id));
    } catch (error) {
      console.error(error);
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
          <tr>
            <th className="p-4 border-b">Details</th>
            <th className="p-4 border-b">Contact</th>
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
  );
};

export default DeliveryBoyTable;
