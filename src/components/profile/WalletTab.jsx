import { useState, useEffect } from "react";
import { FaWallet, FaHistory, FaInfoCircle } from "react-icons/fa";
import { getWalletBalance } from "../../services/walletService";

const WalletTab = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const data = await getWalletBalance();
      setBalance(data.balance);
    } catch (error) {
      console.error("Failed to load wallet", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Wallet</h2>
        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
          Store Credit
        </span>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white opacity-10 rounded-full"></div>

        <div className="relative z-10">
          <p className="text-purple-100 text-sm font-medium mb-1 flex items-center gap-2">
            <FaWallet /> Available Balance
          </p>
          {loading ? (
            <div className="h-10 w-32 bg-white/20 rounded animate-pulse mt-2"></div>
          ) : (
            <h1 className="text-4xl font-bold">
              ₹
              {parseFloat(balance).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </h1>
          )}
          <p className="text-xs text-purple-200 mt-4 opacity-80">
            This balance can be used for future purchases automatically at
            checkout.
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaInfoCircle className="text-gray-400" /> How it works
        </h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <div className="min-w-[4px] h-full bg-green-500 rounded-full"></div>
            <p>
              <strong className="text-gray-800">Refunds:</strong> When you
              return an order, the refunded amount (Credit Note) is instantly
              added here by the admin.
            </p>
          </li>
          <li className="flex gap-3">
            <div className="min-w-[4px] h-full bg-blue-500 rounded-full"></div>
            <p>
              <strong className="text-gray-800">Easy Checkout:</strong> Select
              "Wallet" as a payment method during checkout to use these funds.
            </p>
          </li>
          <li className="flex gap-3">
            <div className="min-w-[4px] h-full bg-orange-500 rounded-full"></div>
            <p>
              <strong className="text-gray-800">Secure:</strong> Your wallet
              balance is safe and never expires.
            </p>
          </li>
        </ul>
      </div>

      {/* Placeholder for Transaction History (Future Feature) */}
      {/* <div className="mt-8">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
           <FaHistory className="text-gray-400" /> Recent Activity
         </h3>
         <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
           No recent transactions found.
         </div>
      </div> 
      */}
    </div>
  );
};

export default WalletTab;
