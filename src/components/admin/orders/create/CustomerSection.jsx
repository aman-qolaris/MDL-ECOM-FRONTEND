import React from "react";
import { FiSearch, FiUser } from "react-icons/fi";

const CustomerSection = ({
  loading,
  user,
  setUser,
  setSelectedAddress,
  registerSearch,
  handleSearch,
  searchErrors,
  onSearchUser,
  registerNewUser,
  handleNewUser,
  userErrors,
  onRegisterUser,
  handleNumberInput,
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h2 className="flex items-center text-lg font-semibold mb-4">
        <FiUser className="mr-2 text-purple-600" /> Customer
      </h2>

      {!user ? (
        <>
          <form onSubmit={handleSearch(onSearchUser)} className="mb-6">
            <div className="flex gap-2">
              <input
                {...registerSearch("phone", {
                  required: "Phone is required",
                  minLength: { value: 10, message: "Must be 10 digits" },
                  maxLength: { value: 10, message: "Must be 10 digits" },
                })}
                type="text"
                placeholder="Search Phone (10 digits)"
                onInput={(e) => handleNumberInput(e, 10)}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white p-2 rounded-lg"
              >
                <FiSearch />
              </button>
            </div>
            {searchErrors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {searchErrors.phone.message}
              </p>
            )}
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">
              OR REGISTER NEW
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form
            onSubmit={handleNewUser(onRegisterUser)}
            className="space-y-3 mt-2"
          >
            <div>
              <input
                {...registerNewUser("name", {
                  required: "Name is required",
                })}
                placeholder="Full Name"
                className="w-full p-2 border rounded-lg"
              />
              {userErrors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {userErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...registerNewUser("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="Email"
                className="w-full p-2 border rounded-lg"
              />
              {userErrors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {userErrors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...registerNewUser("phone", {
                  required: "Phone is required",
                  minLength: { value: 10, message: "Must be 10 digits" },
                })}
                type="text"
                placeholder="Phone (10 digits)"
                onInput={(e) => handleNumberInput(e, 10)}
                className="w-full p-2 border rounded-lg"
              />
              {userErrors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {userErrors.phone.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
              Register Customer
            </button>
          </form>
        </>
      ) : (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 relative">
          <button
            onClick={() => {
              setUser(null);
              setSelectedAddress(null);
            }}
            className="absolute top-2 right-2 text-xs text-red-500 underline"
          >
            Change
          </button>
          <p className="font-bold text-green-800">{user.name}</p>
          <p className="text-sm text-green-700">{user.phone}</p>
          <p className="text-sm text-green-700">{user.email}</p>
        </div>
      )}
    </div>
  );
};

export default CustomerSection;
