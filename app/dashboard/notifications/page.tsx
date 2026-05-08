"use client";

import { useEffect, useState } from "react";
import { Bell, Send, Users, User, Loader2, CheckCircle } from "lucide-react";

type Seller = {
  id: string;
  name: string;
  email: string;
  business: string;
};

type SentNotification = {
  id: string;
  title: string;
  message: string;
  target: string;
  sent_at: string;
};

export default function NotificationsPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [target, setTarget] = useState<"all" | "specific">("all");
  const [selectedSeller, setSelectedSeller] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<SentNotification[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) return;

    // Fetch sellers for dropdown
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/sellers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSellers(data.sellers ?? []))
      .catch(() => null);

    // Fetch sent notifications history
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSent(data.notifications ?? []))
      .catch(() => null);
  }, []);

  const handleSend = async () => {
    setError(null);
    setSuccess(null);

    if (!title.trim()) return setError("Title is required.");
    if (!message.trim()) return setError("Message is required.");
    if (target === "specific" && !selectedSeller)
      return setError("Please select a seller.");

    const token = localStorage.getItem("admin-token");
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            message: message.trim(),
            target_seller_id: target === "specific" ? selectedSeller : null,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send.");

      setSuccess(
        target === "all"
          ? "Notification sent to all sellers!"
          : `Notification sent to ${sellers.find((s) => s.id === selectedSeller)?.name}!`,
      );
      setTitle("");
      setMessage("");
      setSelectedSeller("");

      // Add to sent list
      if (data.notification) {
        setSent((prev) => [data.notification, ...prev]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">
          Send notifications to sellers
        </p>
      </div>

      {/* Compose card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <Bell size={18} className="text-green-500" />
          <h2 className="font-semibold text-gray-900">Compose Notification</h2>
        </div>

        {/* Target */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Send To
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTarget("all")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                target === "all"
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300"
              }`}
            >
              <Users size={16} />
              All Sellers
            </button>
            <button
              onClick={() => setTarget("specific")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                target === "specific"
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300"
              }`}
            >
              <User size={16} />
              Specific Seller
            </button>
          </div>
        </div>

        {/* Seller dropdown */}
        {target === "specific" && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Select Seller
            </label>
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-green-500 transition-colors bg-gray-50"
            >
              <option value="" disabled>
                Choose a seller...
              </option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.business} — {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Platform Update"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-green-500 transition-colors bg-gray-50"
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Message
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your notification message here..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-green-500 transition-colors bg-gray-50 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {message.length} chars
          </p>
        </div>

        {/* Feedback */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={loading || !title || !message}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Send size={16} /> Send Notification
            </>
          )}
        </button>
      </div>

      {/* Sent history */}
      {sent.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">
              Sent History
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {sent.map((n) => (
              <div key={n.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {n.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        n.target === "all"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {n.target === "all" ? "All sellers" : "Specific"}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.sent_at).toLocaleDateString("en-ZA")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
