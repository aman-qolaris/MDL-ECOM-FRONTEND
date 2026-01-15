import { useEffect, useState } from "react";
import { getAddresses } from "../../services/addressService";
import { getCartItems } from "../../store/thunks/cartThunks";

export function useCheckoutInitialization({ user, dispatch }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  useEffect(() => {
    const initCheckout = async () => {
      if (!user) {
        setIsInitializing(false);
        return;
      }

      try {
        const cartAction = await dispatch(getCartItems());
        // If getCartItems was skipped due to thunk `condition` (dedupe), treat it as a no-op.
        if (getCartItems.rejected.match(cartAction)) {
          if (cartAction.error?.name !== "ConditionError") {
            throw cartAction;
          }
        }

        const addresses = await getAddresses(user.id);
        setSavedAddresses(addresses);

        if (addresses.length > 0) {
          setSelectedAddressId(addresses[0].id);
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (error) {
        console.error("Failed to initialize checkout:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initCheckout();
  }, [dispatch, user]);

  return {
    isInitializing,
    savedAddresses,
    selectedAddressId,
    showNewAddressForm,
    setSavedAddresses,
    setSelectedAddressId,
    setShowNewAddressForm,
  };
}
