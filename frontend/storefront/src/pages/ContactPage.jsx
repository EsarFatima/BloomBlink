import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getSiteContent } from '../services/api';

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

  const whatsappNumber = content?.whatsappNumber || '';
  const waLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Hi%20I'm%20interested%20in%20your%20flowers`
    : null;
  const showQr = content?.whatsappShowQr && waLink;

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

            {/* WhatsApp button */}
            {waLink && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  💬
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">WhatsApp</p>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
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
