import { useState } from "react";
import { FaHistory } from "react-icons/fa";
import { useRevenueReport, useTables } from "../../hooks/queries";
import { formatPrice } from "../../utils";
import TableHistory from "../tables/TableHistory";

const periods = [
  { key: "today", label: "Today" },
  { key: "week", label: "7 days" },
  { key: "month", label: "30 days" },
  { key: "all", label: "All time" },
];

const StatCard = ({ title, value, color }) => (
  <div className="rounded-lg p-4" style={{ backgroundColor: color }}>
    <p className="font-medium text-xs text-[#f5f5f5]">{title}</p>
    <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">{value}</p>
  </div>
);

const Section = ({ title, hint, children }) => (
  <div className="bg-[#262626] rounded-lg p-4">
    <h3 className="text-[#f5f5f5] text-lg font-semibold">{title}</h3>
    {hint && <p className="text-[#ababab] text-sm mb-3">{hint}</p>}
    {children}
  </div>
);

const th = "p-3 font-medium";
const td = "p-3";

// Chiffre d'affaires (Admin): kat7sb ghir les commandes confirmées (machi Pending wla Cancelled)
const RevenueReport = () => {
  const [period, setPeriod] = useState("today");
  const [historyTable, setHistoryTable] = useState(null);
  const { data: report, isLoading, isError } = useRevenueReport(period);
  const { data: tables = [] } = useTables();

  // Tables bla 7ta commande f had l-période kayban 7ta homa (b 0)
  const tableRows = tables.map((table) => {
    const row = report?.byTable.find((r) => r.tableId === table._id);
    return { tableId: table._id, tableNo: table.tableNo, orders: 0, guests: 0, revenue: 0, ...row };
  });
  tableRows.sort((a, b) => b.revenue - a.revenue || a.tableNo - b.tableNo);

  const totals = report?.totals;
  const average = totals?.orders ? totals.revenue / totals.orders : 0;

  return (
    <div className="container mx-auto py-2 px-6 md:px-4 pb-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-[#f5f5f5] text-xl">Revenue</h2>
          <p className="text-sm text-[#ababab]">
            Confirmed orders only (pending and cancelled orders are not counted).
          </p>
        </div>
        <div className="flex gap-2">
          {periods.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                period === key ? "bg-[#f6b100] text-[#1f1f1f]" : "bg-[#262626] text-[#ababab]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-[#ababab] mt-6">Loading...</p>}
      {isError && <p className="text-red-400 mt-6">Could not load the report.</p>}

      {report && (
        <>
          <div className="mt-6 grid grid-cols-4 gap-4">
            <StatCard title="Revenue" value={formatPrice(totals.revenue)} color="#025cca" />
            <StatCard title="Orders" value={totals.orders} color="#02ca3a" />
            <StatCard title="Customers" value={totals.guests} color="#f6b100" />
            <StatCard title="Average order" value={formatPrice(average)} color="#5b45b0" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Section title="Dine in / Takeaway">
              {report.byType.length === 0 && <p className="text-gray-500 text-sm">No orders.</p>}
              {report.byType.map((row) => (
                <div key={row.type} className="flex justify-between text-[#f5f5f5] py-1">
                  <span>{row.type} <span className="text-[#ababab] text-sm">({row.orders} orders)</span></span>
                  <span className="font-semibold">{formatPrice(row.revenue)}</span>
                </div>
              ))}
            </Section>
            <Section title="Payment">
              {report.byPayment.length === 0 && <p className="text-gray-500 text-sm">No orders.</p>}
              {report.byPayment.map((row) => (
                <div key={row.method} className="flex justify-between text-[#f5f5f5] py-1">
                  <span>{row.method} <span className="text-[#ababab] text-sm">({row.orders} orders)</span></span>
                  <span className="font-semibold">{formatPrice(row.revenue)}</span>
                </div>
              ))}
            </Section>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 items-start">
            <Section title="By table" hint="Open a table's history to see who ate there, what they ordered and who served them.">
              <table className="w-full text-left text-[#f5f5f5] text-sm">
                <thead className="bg-[#333] text-[#ababab]">
                  <tr>
                    <th className={th}>Table</th>
                    <th className={th}>Orders</th>
                    <th className={th}>Customers</th>
                    <th className={th}>Revenue</th>
                    <th className={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.tableId} className="border-b border-gray-600">
                      <td className={td}>Table {row.tableNo}</td>
                      <td className={td}>{row.orders}</td>
                      <td className={td}>{row.guests}</td>
                      <td className={`${td} font-semibold`}>{formatPrice(row.revenue)}</td>
                      <td className={`${td} text-right`}>
                        <button
                          onClick={() => setHistoryTable({ id: row.tableId, name: row.tableNo })}
                          className="text-[#ababab] hover:text-[#f5f5f5] inline-flex items-center gap-1"
                        >
                          <FaHistory /> History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section title="By waiter" hint="Orders each staff member took or confirmed.">
              <table className="w-full text-left text-[#f5f5f5] text-sm">
                <thead className="bg-[#333] text-[#ababab]">
                  <tr>
                    <th className={th}>Name</th>
                    <th className={th}>Orders</th>
                    <th className={th}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byStaff.length === 0 && (
                    <tr><td className={`${td} text-gray-500`} colSpan={3}>No orders.</td></tr>
                  )}
                  {report.byStaff.map((row) => (
                    <tr key={row.userId ?? "unknown"} className="border-b border-gray-600">
                      <td className={td}>
                        {row.name} {row.role && <span className="text-[#ababab]">· {row.role}</span>}
                      </td>
                      <td className={td}>{row.orders}</td>
                      <td className={`${td} font-semibold`}>{formatPrice(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </div>
        </>
      )}

      <TableHistory table={historyTable} onClose={() => setHistoryTable(null)} />
    </div>
  );
};

export default RevenueReport;
