"use client";
// components/ReviewForm.tsx
// Drop this into the reviews tab of app/shop/[slug]/page.tsx

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

interface Props {
  slug:      string;
  onSuccess: (review: any) => void;
}

export default function ReviewForm({ slug, onSuccess }: Props) {
  const { getValidToken } = useAuthStore();
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return setError("Please select a star rating");
    setError(""); setLoading(true);

    const token = await getValidToken();
    if (!token) return setError("Please sign in to leave a review");

    const res = await fetch(`/api/products/${slug}/reviews`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ rating, comment: comment.trim() || undefined }),
      credentials: "include",
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) return setError(json.error ?? "Failed to submit review");
    setSuccess(true);
    onSuccess(json.data);
  }

  if (success) return (
    <div className="bg-green-950/30 border border-green-800/40 text-green-400 px-5 py-4 text-sm">
      ✓ Thank you for your review! It will appear once verified.
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="border border-white/[0.06] bg-[#111111] p-5 space-y-4">
      <h3 className="font-serif text-lg text-[#F5F0E8] font-light">Write a Review</h3>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Star selector */}
      <div>
        <label className="block text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">Rating *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star} type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className={`text-2xl transition-colors ${
                star <= (hovered || rating) ? "text-[#C9A84C]" : "text-white/[0.12]"
              }`}
            >
              ★
            </button>
          ))}
          {rating > 0 && (
            <span className="text-[#6B6B6B] text-sm ml-2 self-center">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-[#6B6B6B] text-xs tracking-widest uppercase mb-2">
          Comment <span className="normal-case">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience with this wig…"
          maxLength={1000}
          className="w-full bg-[#1A1A1A] border border-white/[0.08] text-[#F5F0E8] px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#6B6B6B] resize-none"
        />
        <p className="text-[#6B6B6B] text-xs mt-1 text-right">{comment.length}/1000</p>
      </div>

      <button type="submit" disabled={loading || rating === 0}
        className="bg-[#C9A84C] hover:bg-[#E2C97E] text-[#0A0A0A] px-6 py-2.5 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}