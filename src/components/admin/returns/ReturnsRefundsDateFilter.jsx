import { FaCalendarAlt } from "react-icons/fa";

const ReturnsRefundsDateFilter = ({ dateRange, onChange, onClear }) => {
  return (
    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
        <FaCalendarAlt /> Filter Date:
      </div>
      <input
        type="date"
        className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-gray-700"
        value={dateRange.start}
        onChange={(e) => onChange({ ...dateRange, start: e.target.value })}
      />
      <span className="text-gray-400">-</span>
      <input
        type="date"
        className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-gray-700"
        value={dateRange.end}
        onChange={(e) => onChange({ ...dateRange, end: e.target.value })}
      />
      {(dateRange.start || dateRange.end) && (
        <button
          onClick={onClear}
          className="text-xs text-red-600 hover:text-red-800 font-bold ml-auto"
        >
          Clear Filter
        </button>
      )}
    </div>
  );
};

export default ReturnsRefundsDateFilter;
