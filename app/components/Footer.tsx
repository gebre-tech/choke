import Link from 'next/link'
import { Mountain, Mail, Phone, MapPin, Heart } from 'lucide-react'

type FooterSettings = { siteName?: string; contactEmail?: string; contactPhone?: string; tagline?: string }

export default function Footer({ settings }: { settings?: FooterSettings }) {
  const name = settings?.siteName ?? 'Choke Mountains Ecovillage'

  return (
    <footer className="bg-stone-950 text-stone-400">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Mountain className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">
                Choke <span className="text-emerald-400">Mountains</span>
              </span>
            </Link>
            <p className="text-stone-400 leading-relaxed mb-6 max-w-sm">
              {settings?.tagline ?? 'A UN Tourism Best Tourism Village — an eco-friendly retreat in the West Gojam Zone, Ethiopia, untouched by modern transportation.'}
            </p>
            <p className="mb-6 flex items-center gap-2 text-xs text-stone-500"><Heart className="h-3.5 w-3.5 text-emerald-400" /> Travel gently. Leave the mountain stronger.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Explore</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/book', label: 'Book a Stay' },
                { href: '/marketplace', label: 'Marketplace' },
                { href: '/media', label: 'Gallery' },
                { href: '/sell', label: 'Sell Local Products' },
                { href: '/login', label: 'Sign In' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Choke Mountains Ecovillage,<br />West Gojam Zone,<br />Amhara Region, Ethiopia</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-stone-300">300 km from Addis Ababa<br />via Debre Markos (4WD)</span>
              </li>
              {settings?.contactEmail && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-emerald-400 transition-colors">
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              {settings?.contactPhone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`tel:${settings.contactPhone}`} className="hover:text-emerald-400 transition-colors">
                    {settings.contactPhone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <span>© {new Date().getFullYear()} {name}. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            West Gojam Zone · Amhara Region · Ethiopia
          </span>
        </div>
      </div>
    </footer>
  )
}
