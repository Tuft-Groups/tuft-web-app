import { useEffect, useRef, useCallback } from "react";
import Loader from "../ui/loader";

interface InfiniteScrollProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
}

export function InfiniteScroll({ loading, hasMore, onLoadMore, children }: InfiniteScrollProps) {
  const observerTarget = useRef(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && !loading && hasMore) {
        onLoadMore();
      }
    },
    [loading, hasMore, onLoadMore]
  );

  useEffect(() => {
    const element = observerTarget.current;
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  return (
    <div className="h-full overflow-y-auto">
      {children}
      <div ref={observerTarget}>
        <Loader loading={loading} className="my-4 w-6 h-6 mx-auto" />
      </div>
    </div>
  );
}
