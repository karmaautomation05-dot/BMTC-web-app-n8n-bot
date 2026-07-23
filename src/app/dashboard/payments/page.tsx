"use client";

import { useMemo, useState } from "react";
import { IndianRupee, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePayments } from "@/hooks/use-api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { RazorpayPayment } from "@/lib/api";

const PER_PAGE = 15;

function statusColor(s: string) {
  const map: Record<string, string> = {
    captured: "bg-emerald-500",
    authorized: "bg-blue-500",
    failed: "bg-red-500",
    refunded: "bg-purple-500",
  };
  return map[s] ?? "bg-muted-foreground";
}

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-mono text-xs text-right break-all max-w-[60%]">{value ?? "—"}</span>
    </div>
  );
}

const STATUSES = ["all", "captured", "failed", "refunded"] as const;

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const { data, isLoading, error } = usePayments();
  const allPayments = data?.items ?? [];

  const filtered = useMemo(() => {
    let list = statusFilter === "all" ? allPayments : allPayments.filter((p) => p.status === statusFilter);
    list = [...list].sort((a, b) =>
      sortDir === "desc" ? b.created_at - a.created_at : a.created_at - b.created_at,
    );
    return list;
  }, [allPayments, statusFilter, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  const payments = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const netAmount = useMemo(() => {
    let captured = 0;
    let refunded = 0;
    for (const p of allPayments) {
      if (p.status === "captured") captured += p.amount;
      else if (p.status === "refunded") refunded += p.amount;
    }
    return captured - refunded;
  }, [allPayments]);

  const [selected, setSelected] = useState<RazorpayPayment | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {filtered.length} txns
          </span>
          <span className="text-sm">
            Total Revenue: <span className="font-semibold">{formatRupees(netAmount)}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium capitalize border transition-colors",
              statusFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {(error as Error).message}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b text-left text-muted-foreground">
              <th className="hidden md:table-cell px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden md:table-cell px-4 py-3 font-medium">Method</th>
              <th className="hidden md:table-cell px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">RRN</th>
              <th className="px-4 py-3 font-medium">
                <button
                  onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Date
                  <ArrowUpDown className={cn("size-3.5 transition-transform", sortDir === "asc" && "rotate-180")} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : !filtered.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  No {statusFilter === "all" ? "" : statusFilter} payments found
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="hidden md:table-cell px-4 py-3 font-mono text-xs text-muted-foreground max-w-[140px] truncate" title={p.id}>
                    {p.id}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatRupees(p.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <span className={cn("size-1.5 rounded-full", statusColor(p.status))} />
                      {p.status}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 capitalize">{p.method ?? "—"}</td>
                  <td className="hidden md:table-cell px-4 py-3 font-mono text-xs">{p.contact ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.acquirer_data?.rrn ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(p.created_at * 1000).toLocaleString("en-IN", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="size-4" />
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected && (
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Payment Details</DialogTitle>
            <div>
              <DetailRow label="Payment ID" value={selected.id} />
              <DetailRow label="Amount" value={formatRupees(selected.amount)} />
              <DetailRow label="Currency" value={selected.currency} />
              <DetailRow label="Status" value={<span className="capitalize">{selected.status}</span>} />
              <DetailRow label="Method" value={<span className="capitalize">{selected.method}</span>} />
              <DetailRow label="Contact" value={selected.contact} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Description" value={selected.description} />
              <DetailRow label="Order ID" value={selected.order_id} />
              <DetailRow label="Invoice ID" value={selected.invoice_id} />
              <DetailRow label="RRN" value={selected.acquirer_data?.rrn} />
              <DetailRow label="UPI Transaction ID" value={selected.acquirer_data?.upi_transaction_id} />
              <DetailRow label="UPI Payer Account" value={selected.acquirer_data?.upi?.payer_account_type} />
              <DetailRow label="VPA" value={selected.vpa ?? selected.acquirer_data?.upi?.vpa} />
              <DetailRow label="Wallet" value={selected.wallet} />
              <DetailRow label="Card ID" value={selected.card_id} />
              <DetailRow label="Bank" value={selected.bank} />
              <DetailRow label="Fee" value={selected.fee != null ? formatRupees(selected.fee) : "—"} />
              <DetailRow label="Tax" value={selected.tax != null ? formatRupees(selected.tax) : "—"} />
              <DetailRow label="Error" value={selected.error_description} />
              <DetailRow label="Created At" value={new Date(selected.created_at * 1000).toLocaleString("en-IN")} />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
