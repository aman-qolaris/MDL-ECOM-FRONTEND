import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={twMerge(clsx("animate-pulse bg-gray-200 rounded", className))}
      {...props}
    />
  );
};

export default Skeleton;
