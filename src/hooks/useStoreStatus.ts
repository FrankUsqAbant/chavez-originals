import { useEffect, useState } from 'react';
import { getStoreStatus, type StoreStatus } from '../utils/store';

/** Estado de atención de la tienda (hora de Lima), actualizado cada minuto. */
export function useStoreStatus(): StoreStatus {
  const [status, setStatus] = useState<StoreStatus>(() => getStoreStatus());

  useEffect(() => {
    const id = window.setInterval(() => setStatus(getStoreStatus()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return status;
}
