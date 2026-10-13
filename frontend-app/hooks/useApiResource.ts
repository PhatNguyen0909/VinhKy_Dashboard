import { useCallback, useEffect, useState } from 'react';

export function useApiResource<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setError(null);

    loader()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Đã xảy ra lỗi không xác định.'
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      active = false;
    };
  }, [loader, reloadKey]);

  const reload = useCallback(() => {
    setLoading(data === null);
    setRefreshing(data !== null);
    setReloadKey((key) => key + 1);
  }, [data]);
  return { data, loading, refreshing, error, reload };
}
