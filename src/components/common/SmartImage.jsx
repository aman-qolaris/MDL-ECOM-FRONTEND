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

export default SmartImage;
