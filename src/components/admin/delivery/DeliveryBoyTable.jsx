/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  FaTrash,
  FaBoxOpen,
  FaEdit,
  FaSave,
  FaTimes,
  FaUserSecret,
  FaChevronDown,
} from "react-icons/fa";
import {
  deleteDeliveryBoy,
  updateDeliveryBoy,
  getDeliveryLocations,
} from "../../../services/orderService";

const DeliveryBoyTable = ({ boys, setBoys }) => {
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState(true);
  const [editMaxOrders, setEditMaxOrders] = useState(20);

  const [editAssignedAreas, setEditAssignedAreas] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await getDeliveryLocations();
        const activeAreaNames = data.map((item) => item.areaName);
        setAvailableAreas(activeAreaNames);
      } catch (error) {
        console.error("Failed to load areas for table edit", error);
      }
    };
    fetchAreas();
  }, []);

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
    // Initialize the array directly
    setEditAssignedAreas(boy.assignedAreas || []);
    setIsDropdownOpen(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsDropdownOpen(false);
  };

  const toggleAreaSelection = (area) => {
    if (editAssignedAreas.includes(area)) {
      setEditAssignedAreas(editAssignedAreas.filter((a) => a !== area));
    } else {
      setEditAssignedAreas([...editAssignedAreas, area]);
    }
  };

  const removeArea = (areaToRemove) => {
    setEditAssignedAreas(editAssignedAreas.filter((a) => a !== areaToRemove));
  };

  const handleSaveEdit = async (id) => {
    if (editAssignedAreas.length === 0) {
      alert("Please assign at least one delivery area.");
      return;
    }

    try {
      await updateDeliveryBoy(id, {
        active: editStatus,
        maxOrders: parseInt(editMaxOrders),
        assignedAreas: editAssignedAreas, // Pass the array directly
      });

      setBoys(
        boys.map((b) =>
          b.id === id
            ? {
                ...b,
                active: editStatus,
                maxOrders: parseInt(editMaxOrders),
                assignedAreas: editAssignedAreas,
              }
            : b,
        ),
      );
      setEditingId(null);
      setIsDropdownOpen(false);
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
            <th className="p-4 border-b w-[40%]">Coverage Areas</th>
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

              <td className="p-4 align-top">
                {editingId === boy.id ? (
                  // 🟢 NEW EDIT UI: Multi-Select Pill Dropdown
                  <div className="relative">
                    <div
                      className="min-h-[38px] w-full border border-gray-300 p-1.5 rounded bg-white flex flex-wrap gap-1.5 items-center pr-8 cursor-pointer"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      {editAssignedAreas.length === 0 ? (
                        <span className="text-gray-400 pl-1 text-sm">
                          Select areas...
                        </span>
                      ) : (
                        editAssignedAreas.map((area) => (
                          <span
                            key={area}
                            className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded"
                          >
                            {area}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeArea(area);
                              }}
                              className="hover:text-red-500 transition-colors focus:outline-none"
                            >
                              <FaTimes size={10} />
                            </button>
                          </span>
                        ))
                      )}
                      <FaChevronDown
                        className={`absolute right-2 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                        size={10}
                      />
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                        {availableAreas.length === 0 ? (
                          <div className="p-2 text-xs text-gray-500 text-center italic">
                            No active areas found.
                          </div>
                        ) : (
                          availableAreas.map((area) => (
                            <label
                              key={area}
                              className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-none ${editAssignedAreas.includes(area) ? "bg-blue-50/50" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={editAssignedAreas.includes(area)}
                                onChange={() => toggleAreaSelection(area)}
                                className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-700">
                                {area}
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // STANDARD VIEW UI
                  <div className="flex flex-wrap gap-1.5">
                    {boy.assignedAreas && boy.assignedAreas.length > 0 ? (
                      boy.assignedAreas.map((area, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 border border-blue-100 text-blue-700 text-[11px] px-2 py-1 rounded-md font-medium"
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

              <td className="p-4 text-center align-top">
                {editingId === boy.id ? (
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value === "true")}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                ) : (
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      boy.active
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {boy.active ? "Active" : "Inactive"}
                  </span>
                )}
              </td>

              <td className="p-4 text-center align-top">
                {editingId === boy.id ? (
                  <input
                    type="number"
                    min="1"
                    value={editMaxOrders}
                    onChange={(e) => setEditMaxOrders(e.target.value)}
                    className="w-16 border border-gray-300 rounded px-2 py-1.5 text-center text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-gray-700 bg-gray-50 rounded-md py-1 px-2 border border-gray-100 w-max mx-auto">
                    <FaBoxOpen className="text-gray-400" size={14} />
                    <span className="font-bold text-sm">{boy.maxOrders}</span>
                  </div>
                )}
              </td>

              <td className="p-4 text-center align-top">
                <div className="flex items-center justify-center gap-2">
                  {editingId === boy.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(boy.id)}
                        className="text-green-600 hover:text-white p-2.5 rounded-lg hover:bg-green-600 transition-colors border border-green-200 hover:border-transparent"
                        title="Save Changes"
                      >
                        <FaSave size={14} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-500 hover:text-white p-2.5 rounded-lg hover:bg-gray-500 transition-colors border border-gray-200 hover:border-transparent"
                        title="Cancel"
                      >
                        <FaTimes size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(boy)}
                        className="text-blue-600 hover:text-white p-2.5 rounded-lg hover:bg-blue-600 transition-colors border border-blue-100 hover:border-transparent"
                        title="Edit Partner"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(boy.id)}
                        className="text-red-600 hover:text-white p-2.5 rounded-lg hover:bg-red-600 transition-colors border border-red-100 hover:border-transparent"
                        title="Delete Partner"
                      >
                        <FaTrash size={14} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {boys.length === 0 && (
            <tr>
              <td
                colSpan="6"
                className="p-12 text-center text-gray-500 bg-gray-50/50"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-3">
                    <FaUserSecret size={32} className="text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-700">
                    No delivery partners registered yet.
                  </p>
                  <p className="text-sm mt-1">
                    Use the form above to add your first partner.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryBoyTable;
