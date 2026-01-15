import { useEffect, useMemo, useRef, useState } from "react";
import { List } from "react-window";

const getColumnCount = (width) => {
  if (width < 640) return 1; // sm
  if (width < 1024) return 2; // md
  return 3; // lg
};

const DEFAULT_ROW_HEIGHT = 420;
const DEFAULT_GAP_PX = 24; // Tailwind gap-6

const VirtualizedProductGrid = ({
  items,
  renderItem,
  rowHeight = DEFAULT_ROW_HEIGHT,
  gapPx = DEFAULT_GAP_PX,
}) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerWidth(rect.width);
      // Keep scroll in the results area to enable windowing
      const nextHeight = Math.max(320, Math.min(900, window.innerHeight - 260));
      setContainerHeight(nextHeight);
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const columnCount = useMemo(
    () => getColumnCount(containerWidth || 0),
    [containerWidth]
  );

  const columnWidth = useMemo(() => {
    if (!containerWidth || columnCount <= 0) return 0;
    const totalGap = gapPx * (columnCount - 1);
    return Math.floor((containerWidth - totalGap) / columnCount);
  }, [containerWidth, columnCount, gapPx]);

  const rowCount = useMemo(() => {
    if (!items?.length) return 0;
    return Math.ceil(items.length / columnCount);
  }, [items, columnCount]);

  const itemData = useMemo(
    () => ({ items, renderItem, columnCount, columnWidth, rowHeight, gapPx }),
    [items, renderItem, columnCount, columnWidth, rowHeight, gapPx]
  );

  const Row = ({ ariaAttributes, index, style, ...rowProps }) => {
    const start = index * rowProps.columnCount;
    const end = Math.min(start + rowProps.columnCount, rowProps.items.length);
    const rowItems = rowProps.items.slice(start, end);

    return (
      <div
        {...ariaAttributes}
        style={{
          ...style,
          display: "grid",
          gridTemplateColumns: `repeat(${rowProps.columnCount}, minmax(0, 1fr))`,
          columnGap: rowProps.gapPx,
          alignItems: "start",
          paddingBottom: rowProps.gapPx,
        }}
      >
        {rowItems.map((item) => (
          <div key={item.id} style={{ width: rowProps.columnWidth }}>
            {rowProps.renderItem(item)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="w-full">
      {containerWidth > 0 && columnWidth > 0 && containerHeight > 0 && (
        <List
          rowCount={rowCount}
          rowHeight={rowHeight + gapPx}
          rowComponent={Row}
          rowProps={itemData}
          overscanCount={3}
          style={{ height: containerHeight, width: containerWidth }}
          className="will-change-transform"
        >
          {null}
        </List>
      )}
    </div>
  );
};

export default VirtualizedProductGrid;
