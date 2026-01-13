/* eslint-disable react/prop-types */
import { FaStore, FaBuilding, FaMapMarkerAlt, FaClock } from "react-icons/fa";

const BusinessInfoForm = ({ register, errors }) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2 border-b border-gray-200/50 pb-2 mb-6">
        <FaStore className="text-purple-600" /> Business Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            Business Name *
          </label>
          <div className="relative">
            <FaBuilding className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type="text"
              {...register("businessName")}
              className="input-glass pl-10"
              placeholder="My Awesome Store"
            />
          </div>
          <p className="error-text">{errors.businessName?.message}</p>
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            Business Type *
          </label>
          <div className="relative">
            <FaStore className="absolute top-3.5 left-3 text-gray-400" />
            <select
              {...register("businessType")}
              className="input-glass pl-10 appearance-none"
            >
              <option value="Retail">Retailer</option>
              <option value="Wholesale">Wholesaler</option>
              <option value="Manufacturer">Manufacturer</option>
            </select>
          </div>
          <p className="error-text">{errors.businessType?.message}</p>
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            Physical Address *
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute top-3.5 left-3 text-gray-400" />
            <textarea
              {...register("businessAddress")}
              rows="2"
              className="input-glass pl-10"
              placeholder="Shop No, Street, City..."
            ></textarea>
          </div>
          <p className="error-text">{errors.businessAddress?.message}</p>
        </div>

        {/* Years in Business */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">
            Years in Business *
          </label>
          <div className="relative">
            <FaClock className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type="number"
              {...register("yearsInBusiness")}
              min="0"
              className="input-glass pl-10"
              placeholder="e.g. 5"
            />
          </div>
          <p className="error-text">{errors.yearsInBusiness?.message}</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfoForm;
