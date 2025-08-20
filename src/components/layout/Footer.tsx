import { getSiteMenu } from "@/lib/menu";

export default async function Footer() {
  const menu = await getSiteMenu();
  const ft = menu?.footer;
  if (!ft?.isActive) return null;

  return (
    <footer className="bg-[#141c2a] text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
        {(ft.columns || []).slice(0,3).map((col:any, ci:number)=>(
          <div key={ci}>
            <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
            <ul className="space-y-2 text-sm/6 text-white/80">
              {(col.links||[]).map((ln:any, li:number)=>(
                <li key={li}>
                  <a href={ln.url} target={ln.external?"_blank":undefined} rel={ln.external?"noopener noreferrer":undefined} className="hover:underline">{ln.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {/* İletişim */}
        <div>
          <h4 className="text-sm font-semibold mb-4">İLETİŞİM</h4>
          <div className="text-sm/6 text-white/80 space-y-2">
            {ft.contact?.email && <div>📧 {ft.contact.email}</div>}
            {ft.contact?.phone && <div>📞 {ft.contact.phone}</div>}
            {ft.contact?.address && <div>📍 {ft.contact.address}</div>}
            <div className="flex gap-3 pt-2">
              {(ft.socials || []).filter((s:any)=>s.isActive).map((s:any, i:number)=>(
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.platform}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Harita */}
      {ft.map?.isActive && (ft.map.embedUrl) && (
        <div className="w-full h-[300px]">
          <iframe
            src={ft.map.embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      )}
      {/* Bottom */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between text-white/70 text-xs">
        <div>© {new Date().getFullYear()} Kültür-İş. Tüm hakları saklıdır.</div>
        <div className="flex items-center gap-4">
          {(ft.bottomLinks||[]).map((b:any,i:number)=>(
            <a key={i} href={b.url} className="hover:underline">{b.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
