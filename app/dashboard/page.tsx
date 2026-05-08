"use client";

import { useEffect, useState } from "react";
import { Users, Package, Star, TrendingUp } from "lucide-react";

type Stats = {
  totalSellers: number;
  totalProducts: number;
  sponsoredProducts: number;
  outOfStock: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data.stats))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Total Sellers",
      value: stats?.totalSellers ?? "—",
      icon: <Users size={20} className="text-blue-500" />,
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-600",
    },
    {
      label: "Total Products",
      value: stats?.totalProducts ?? "—",
      icon: <Package size={20} className="text-green-500" />,
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-600",
    },
    {
      label: "Sponsored",
      value: stats?.sponsoredProducts ?? "—",
      icon: <Star size={20} className="text-yellow-500" />,
      bg: "bg-yellow-50",
      border: "border-yellow-100",
      text: "text-yellow-600",
    },
    {
      label: "Out of Stock",
      value: stats?.outOfStock ?? "—",
      icon: <TrendingUp size={20} className="text-red-500" />,
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide statistics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`bg-white border ${c.border} rounded-2xl p-5 shadow-sm`}
          >
            <div
              className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-4`}
            >
              {c.icon}
            </div>
            <p className="text-sm text-gray-500">{c.label}</p>
            {loading ? (
              <div className="h-8 bg-gray-100 rounded-lg mt-1 animate-pulse w-16" />
            ) : (
              <p className={`text-3xl font-bold mt-1 ${c.text}`}>{c.value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
