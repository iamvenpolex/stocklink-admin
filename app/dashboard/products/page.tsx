"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2, AlertTriangle, Search, Star, ImageOff } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  location: string;
  stock: number;
  images: string[];
  is_promoted: boolean;
  sellers: { name: string; business: string };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const toggleSponsored = async (id: string, current: boolean) => {
    const token = localStorage.getItem("admin-token");
    setTogglingId(id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${id}/sponsor`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_promoted: !current }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_promoted: !current } : p)),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem("admin-token");
    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${deleteId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sellers?.business?.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const toDelete = products.find((p) => p.id === deleteId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-500 text-sm mt-1">
          {products.length} total products
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 shadow-sm focus-within:border-green-500 transition-colors">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, seller or category..."
          className="w-full py-3 outline-none text-sm text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Seller
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Sponsored
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-20" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="text-gray-400 text-sm">No products found</p>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((p) => {
                const image = p.images?.[0] ?? null;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {image ? (
                            <Image
                              src={image}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageOff size={14} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1 max-w-[160px]">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400">{p.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* Seller */}
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {p.sellers?.business ?? "—"}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      R{Number(p.price).toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${p.stock === 0 ? "text-red-500" : "text-gray-700"}`}
                      >
                        {p.stock === 0 ? "Sold out" : p.stock}
                      </span>
                    </td>

                    {/* Sponsored toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleSponsored(p.id, p.is_promoted)}
                        disabled={togglingId === p.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          p.is_promoted
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <Star
                          size={12}
                          className={
                            p.is_promoted
                              ? "fill-yellow-500 text-yellow-500"
                              : ""
                          }
                        />
                        {togglingId === p.id
                          ? "..."
                          : p.is_promoted
                            ? "Sponsored"
                            : "Sponsor"}
                      </button>
                    </td>

                    {/* Delete */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={22} className="text-red-500" />
              <h2 className="font-bold text-lg text-gray-900">
                Delete Product?
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {toDelete?.name}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 size={14} /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
