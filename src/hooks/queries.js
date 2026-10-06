import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getMenu, getOrders, getPaymentConfig, getStats, getTables } from "../https";

// Queries partagees: nefs queryKey = cache wa7ed bin les pages
const select = (res) => res.data.data;

export const useOrders = () =>
  useQuery({ queryKey: ["orders"], queryFn: getOrders, select, placeholderData: keepPreviousData });

export const useTables = () =>
  useQuery({ queryKey: ["tables"], queryFn: getTables, select, placeholderData: keepPreviousData });

export const useMenu = () => useQuery({ queryKey: ["menu"], queryFn: getMenu, select });

export const useStats = () =>
  useQuery({ queryKey: ["stats"], queryFn: getStats, select, refetchInterval: 60000 });

export const usePaymentConfig = () =>
  useQuery({ queryKey: ["payment-config"], queryFn: getPaymentConfig, select, staleTime: Infinity });

// Ba3d ay commande/changement de statut, had les donnees kollhom tbeddlo
export const ORDER_RELATED_KEYS = [["orders"], ["tables"], ["stats"]];
