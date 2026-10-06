import { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import { enqueueSnackbar } from "notistack";
import { useTables } from "../hooks/queries";

const filters = [
  { key: "all", label: "All" },
  { key: "Available", label: "Available" },
  { key: "Booked", label: "Booked" },
];

const Tables = () => {
  const [status, setStatus] = useState("all");

    useEffect(() => {
      document.title = "POS | Tables"
    }, [])

  const { data: tables = [], isError } = useTables();

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [isError]);

  const visibleTables = status === "all" ? tables : tables.filter((table) => table.status === status);

  return (
    <section className="bg-[#1f1f1f]  h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Tables
          </h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={`text-[#ababab] text-lg ${status === key ? "bg-[#383838]" : ""} rounded-lg px-5 py-2 font-semibold`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 px-16 py-4 h-[650px] overflow-y-scroll scrollbar-hide content-start">
        {visibleTables.length === 0 && (
          <p className="col-span-5 text-gray-500">No tables. An admin can add them from the dashboard.</p>
        )}
        {visibleTables.map((table) => {
          return (
            <TableCard
              key={table._id}
              id={table._id}
              name={table.tableNo}
              status={table.status}
              initials={table?.currentOrder?.customerDetails.name}
              seats={table.seats}
            />
          );
        })}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;
