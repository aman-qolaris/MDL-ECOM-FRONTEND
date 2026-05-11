import React from "react";
import PropTypes from "prop-types";
import Skeleton from "../ui/Skeleton";

const AdminTableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
      {/* Header Skeleton */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`head-col-${columns}-${i}`}
            className="h-6 flex-1 bg-gray-300"
          />
        ))}
      </div>

      {/* Rows Skeleton */}
      <div className="p-0">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={`row-box-${rows}-${i}`}
            className="flex gap-4 p-4 border-b border-gray-100 items-center"
          >
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton
                key={`cell-${rows}-${columns}-${i}-${j}`}
                className="h-5 flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

AdminTableSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
};

export default AdminTableSkeleton;
