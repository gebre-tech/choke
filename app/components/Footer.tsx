type FooterSettings = { siteName?: string; contactEmail?: string; contactPhone?: string; tagline?: string }

export default function Footer({ settings }: { settings?: FooterSettings }) {
  const name = settings?.siteName ?? 'Choke Panoramic Eco-Lodge'
  return (
    <footer className="bg-slate-900 text-stone-300 mt-4">
      <div className="container mx-auto px-4 py-8 grid gap-6 md:grid-cols-3">
        <div>
          <p className="font-semibold text-white">{name}</p>
          {settings?.tagline && <p className="text-sm text-stone-400 mt-1">{settings.tagline}</p>}
        </div>
        <div className="text-sm space-y-1">
          <p className="font-semibold text-white">Contact</p>
          {settings?.contactEmail && <p>{settings.contactEmail}</p>}
          {settings?.contactPhone && <p>{settings.contactPhone}</p>}
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Choke Mountain</p>
          <p className="text-stone-400">Dega Damot, Ethiopia · 4,070 m above the clouds</p>
        </div>
      </div>
      <div className="border-t border-stone-800 text-center py-4 text-xs text-stone-500">
        © {new Date().getFullYear()} {name}
      </div>
    </footer>
  )
}