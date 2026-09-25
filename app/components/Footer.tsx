import Link from 'next/link'
import { Mountain, Mail, Phone, MapPin } from 'lucide-react'

type FooterSettings = { siteName?: string; contactEmail?: string; contactPhone?: string; tagline?: string }

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
)
const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

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
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: <FacebookIcon />, label: 'Facebook', href: '#' },
                { icon: <InstagramIcon />, label: 'Instagram', href: '#' },
                { icon: <TwitterXIcon />, label: 'X (Twitter)', href: '#' },
              ].map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 flex items-center justify-center transition-all"
                >
                  {icon}
                </a>
              ))}
            </div>
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
                <span className="text-stone-500">300 km from Addis Ababa<br />via Debre Markos (4WD)</span>
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
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
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