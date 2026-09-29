"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { styles } from "../../styles/commonStyles";
import { errorMessage } from "../../lib/apiError";

const stateStyles = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-sky-100 text-sky-700",
  expired: "bg-secondary text-primary/60",
};

export default function OrdersManager() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json().catch(() => ({}));
      if (res.ok) setOrders(Array.isArray(data.orders) ? data.orders : []);
      else toast.error(errorMessage(t, data, "errors.generic"));
    } catch {
      toast.error(t("errors.network"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const formatAmount = (amount, currency) => {
    try {
      return new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: (currency || "usd").toUpperCase(),
      }).format(amount / 100);
    } catch {
      return `${(amount / 100).toFixed(2)} ${(currency || "usd").toUpperCase()}`;
    }
  };

  const formatDate = (value) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return "";
    }
  };

  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10 sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-hind-siliguri text-lg font-bold text-primary">
            {t("admin.tab.orders")}
          </h2>
          <p className="mt-0.5 text-sm text-primary/60">
            {t("admin.orders.count", { count: orders.length })}
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t("common.refresh")}
        </button>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-primary/60">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t("common.loading")}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-xl bg-secondary p-10 text-center">
          <CreditCard className="mx-auto h-8 w-8 text-primary/40" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-primary/70">
            {t("admin.orders.empty")}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-start">
            <thead>
              <tr className="border-b border-primary/10 text-start text-xs font-bold uppercase tracking-wider text-primary/50">
                <th className="px-4 py-3 text-start">{t("admin.orders.customer")}</th>
                <th className="px-4 py-3 text-start">{t("admin.orders.plan")}</th>
                <th className="hidden px-4 py-3 text-start sm:table-cell">
                  {t("admin.orders.amount")}
                </th>
                <th className="px-4 py-3 text-start">{t("admin.orders.status")}</th>
                <th className="hidden px-4 py-3 text-start md:table-cell">
                  {t("admin.orders.date")}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-primary/5 last:border-0"
                >
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-primary">
                      {order.user?.name || order.email}
                    </p>
                    <p className="text-xs text-primary/50">{order.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-primary">
                      {order.planName}
                    </p>
                    <p className="text-xs text-primary/50">
                      {t("landing.pricing.classesPerMonth", {
                        count: order.classes,
                      })}
                    </p>
                  </td>
                  <td className="hidden px-4 py-4 text-sm font-semibold text-primary sm:table-cell">
                    {formatAmount(order.amount, order.currency)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        stateStyles[order.status] || "bg-secondary text-primary/70"
                      }`}
                    >
                      {t(`payment.status.${order.status}`)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-4 text-xs text-primary/50 md:table-cell">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
