import { useState, useEffect } from "react";
import { getCHZPricePyth } from "@/app/actions/getCHZPricePyth";

/**
 * @notice Hook for fetching CHZ price from Pyth
 * @dev Automatically fetches price when dialog opens
 * @param isDialogOpen Whether prediction dialog is open
 * @return CHZ price in USD or null if not loaded
 */
export function useCHZPrice(isDialogOpen: boolean): number | null {
  const [chzPrice, setChzPrice] = useState<number | null>(null);

  useEffect(() => {
    if (isDialogOpen && !chzPrice) {
      getCHZPricePyth()
        .then((price) => {
          setChzPrice(price);
        })
        .catch((error) => {
          console.error("Error fetching CHZ price:", error);
        });
    }
  }, [isDialogOpen, chzPrice]);

  return chzPrice;
}
