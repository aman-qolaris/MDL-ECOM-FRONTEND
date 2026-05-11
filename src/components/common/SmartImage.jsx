import React from "react";
import PropTypes from "prop-types";

const SmartImage = ({
  src,
  alt,
  className,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  width,
  height,
  sizes,
  srcSet,
  onLoad,
  onError,
}) => {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt || ""}
      className={className}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      width={width}
      height={height}
      sizes={sizes}
      srcSet={srcSet}
      onLoad={onLoad}
      onError={onError}
    />
  );
};

SmartImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  loading: PropTypes.oneOf(["lazy", "eager"]),
  decoding: PropTypes.oneOf(["async", "auto", "sync"]),
  fetchPriority: PropTypes.oneOf(["high", "low", "auto"]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sizes: PropTypes.string,
  srcSet: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default SmartImage;
