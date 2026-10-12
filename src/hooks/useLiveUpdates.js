import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ORDER_RELATED_KEYS } from "./queries";

// Kol type d event -> les queries li khasshom ytchargaw mn jdid
export const EVENT_KEYS = {
  orders: ORDER_RELATED_KEYS,
  tables: [["tables"], ["table-history"]],
  menu: [["menu"], ["stats"]],
};

const RETRY_AFTER_CLOSE_MS = 30000;

// Live updates: server kaygoul "commandes tbeddlo" (SSE) w 7na kan3awdo nchargiw ghir dakchi.
// Polling (refetchInterval f queries.js) kayb9a ghir backup ila t9ta3 l-connexion.
const useLiveUpdates = (enabled) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || typeof EventSource === "undefined") return;

    let source;
    let retryTimer;
    let connectedOnce = false;

    const invalidate = (keys) =>
      keys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));

    const connect = () => {
      source = new EventSource("/api/events");

      source.onopen = () => {
        // Reconnexion: momkin ft-na chi events, donc kan3awdo nchargiw kolchi
        if (connectedOnce) invalidate(Object.values(EVENT_KEYS).flat());
        connectedOnce = true;
      };

      source.onmessage = (event) => {
        try {
          const keys = EVENT_KEYS[JSON.parse(event.data).type];
          if (keys) invalidate(keys);
        } catch {
          // event ma mfhoumch: n-ignoriwh
        }
      };

      // EventSource kay3awd bo7do (retry: 5s) mn ghir ila server rja3 erreur (ex: 401):
      // f had l-7ala kaysedd, w 7na kan3awdo njerbo ba3d 30s
      source.onerror = () => {
        if (source.readyState === EventSource.CLOSED) {
          clearTimeout(retryTimer);
          retryTimer = setTimeout(connect, RETRY_AFTER_CLOSE_MS);
        }
      };
    };

    connect();
    return () => {
      clearTimeout(retryTimer);
      source?.close();
    };
  }, [enabled, queryClient]);
};

export default useLiveUpdates;
