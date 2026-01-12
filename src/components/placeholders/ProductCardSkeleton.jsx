import Skeleton from "../ui/Skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col h-[330px] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Image Placeholder */}
      <Skeleton className="h-[180px] w-full" />

      <div className="p-4 flex flex-col flex-grow space-y-3">
        {/* Category Badge */}
        <Skeleton className="h-3 w-1/3 rounded-full" />

        {/* Title (2 lines) */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Price & Button */}
        <div className="mt-auto flex items-center justify-between pt-3">
          <Skeleton className="h-6 w-20" /> {/* Price */}
          <Skeleton className="h-9 w-9 rounded-full" /> {/* Cart Button */}
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
