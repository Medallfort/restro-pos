import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getMenu,
  getMyOrders,
  getOrders,
  getPaymentConfig,
  getRevenueReport,
  getStats,
  getTableHistory,
  getTables,
} from "../https";

// Queries partagees: nefs queryKey = cache wa7ed bin les pages
const select = (res) => res.data.data;

// Refresh kol 15s: bach serveur ychouf les commandes dyal les clients (Pending) bla ma y-actualiser
export const useOrders = () =>
  useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    select,
    placeholderData: keepPreviousData,
    refetchInterval: 15000,
  });

// Client: ghir les commandes dyalo, bach ychouf imta t-confirmat w imta wajda
export const useMyOrders = () =>
  useQuery({ queryKey: ["my-orders"], queryFn: getMyOrders, select, refetchInterval: 15000 });

export const useRevenueReport = (period) =>
  useQuery({
    queryKey: ["revenue", period],
    queryFn: () => getRevenueReport(period),
    select,
    placeholderData: keepPreviousData,
  });

export const useTables = () =>
  useQuery({ queryKey: ["tables"], queryFn: getTables, select, placeholderData: keepPreviousData });

// Kat-chargea ghir mli l-modal dyal l-historique kaykoun m7loul (tableId machi null)
export const useTableHistory = (tableId) =>
  useQuery({
    queryKey: ["table-history", tableId],
    queryFn: () => getTableHistory(tableId),
    select,
    enabled: Boolean(tableId),
  });

export const useMenu =() => useQuery({ queryKey: ["menu"], queryFn: getMenu, select });

export const useStats = () =>
  useQuery({ queryKey: ["stats"], queryFn: getStats, select, refetchInterval: 60000 });

export const usePaymentConfig = () =>
  useQuery({ queryKey: ["payment-config"], queryFn: getPaymentConfig, select, staleTime: Infinity });

// Ba3d ay commande/changement de statut, had les donnees kollhom tbeddlo
export const ORDER_RELATED_KEYS = [
  ["orders"],
  ["my-orders"],
  ["tables"],
  ["stats"],
  ["table-history"],
  ["revenue"],
];
