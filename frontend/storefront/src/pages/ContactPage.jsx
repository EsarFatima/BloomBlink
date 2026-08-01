import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getSiteContent } from '../services/api';

const WA_MESSAGE = encodeURIComponent("Hi I'm interested in your flowers");

function buildWaLink(raw) {
  if (!raw) return null;
  const n = raw.replace(/[+\s\-().]/g, '').replace(/^0/, '');
  return /^[1-9]\d{7,14}$/.test(n) ? `https://wa.me/${n}?text=${WA_MESSAGE}` : null;
}

const FALLBACK_CONTACT = {
  phone: '+1 (555) 123-4567',
  email: 'hello@bloomblink.com',
  address: '123 Petal Lane, Garden City, NY 11530',
};

export default function ContactPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteContent()
      .then(setContent)
      .catch(() => setContent({}))
      .finally(() => setLoading(false));
  }, []);

  const hasRealContact = content?.contact?.phone || content?.contact?.email || content?.contact?.address;
  const contact = hasRealContact ? content.contact : FALLBACK_CONTACT;

  const waLink = buildWaLink(content?.whatsappNumber || '');
  const showQr = waLink && content?.whatsappShowQr;

  const socialLinks = Array.isArray(content?.socialLinks) ? content.socialLinks : [];

  const contactItems = [
    { icon: '📱', label: 'Phone', value: contact.phone, href: `tel:${contact.phone}` },
    { icon: '✉️', label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
    { icon: '📍', label: 'Address', value: contact.address, href: null },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <div className="text-center mb-10">
        <span className="text-5xl">📞</span>
        <h1 className="text-4xl font-bold text-rose-700 mt-4 mb-3">Contact Us</h1>
        <div className="w-16 h-1 bg-rose-300 rounded mx-auto" />
        <p className="text-gray-500 mt-4">We'd love to hear from you. Reach out anytime!</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Contact info card */}
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8 space-y-6">
            {contactItems.map(({ icon, label, value, href }) =>
              value ? (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
                    {href ? (
                      <a href={href} className="text-rose-700 font-semibold text-lg hover:text-rose-500 transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="text-rose-700 font-semibold text-lg">{value}</p>
                    )}
                  </div>
                </div>
              ) : null
            )}


          </div>

          {/* WhatsApp QR code */}
          {showQr && (
            <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8 flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-gray-500">Scan to chat on WhatsApp</p>
              <QRCodeSVG value={waLink} size={160} bgColor="#ffffff" fgColor="#16a34a" level="M" />
              <p className="text-xs text-gray-400">{waLink}</p>
            </div>
          )}

          {/* Social / additional links */}
          {socialLinks.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-4">Find us online</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-medium px-4 py-2 rounded-full border border-rose-100 transition-colors"
                  >
                    {link.label}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
