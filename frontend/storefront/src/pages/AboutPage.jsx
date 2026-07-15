import { useState, useEffect } from 'react';
import { getSiteContent } from '../services/api';

const FALLBACK = `Welcome to Bloom & Blink — a flower shop born from a love of nature and beauty.

We believe every occasion deserves the perfect bloom. Whether it's a wedding, a birthday, a heartfelt apology, or just a Tuesday that needs brightening, we handpick the freshest flowers to make your moment unforgettable.

Our arrangements are crafted with care, creativity, and a deep passion for floristry. From classic red roses to exotic tropical arrangements, we have something for every taste and budget.

Visit us, call us, or order online — we'd love to be part of your story. 🌸`;

export default function AboutPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteContent()
      .then(setContent)
      .catch(() => setContent({}))
      .finally(() => setLoading(false));
  }, []);

  const text = content?.aboutUs || FALLBACK;

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <div className="text-center mb-10">
        <span className="text-5xl">🌺</span>
        <h1 className="text-4xl font-bold text-rose-700 mt-4 mb-3">About Us</h1>
        <div className="w-16 h-1 bg-rose-300 rounded mx-auto" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8">
          <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
      )}
    </div>
  );
}
