/* eslint-disable react/prop-types */
import { FaFilter } from "react-icons/fa";

const DeliveryFilters = ({
  activeTab,
  activeFilter,
  setActiveFilter,
  historyFilterType,
  setHistoryFilterType,
  historyDate,
  setHistoryDate,
  dateRange,
  setDateRange,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm font-bold uppercase tracking-wider">
          <FaFilter /> Filters:
        </div>

        {activeTab === "active" ? (
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["all", "today", "week"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeFilter === f
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f === "all" ? "All" : f === "today" ? "Today" : "This Week"}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={historyFilterType}
              onChange={(e) => setHistoryFilterType(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-md px-3 py-2 outline-none"
            >
              <option value="date">Specific Date</option>
              <option value="range">Date Range</option>
            </select>
            {historyFilterType === "date" ? (
              <input
                type="date"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5"
              />
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5"
                />
                <span>-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryFilters;
