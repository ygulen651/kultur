import Link from "next/link";
import { getSiteMenu } from "@/lib/menu";

export default async function Navbar() {
  const menu = await getSiteMenu();
  const nb = menu?.navbar;
  if (!nb?.isActive) return null;

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          {nb?.brand?.logoLight ? (
            <img src={nb.brand.logoLight} alt={nb.brand?.name || "Logo"} className="h-8 w-auto" />
          ) : (
            <span className="font-bold">{nb?.brand?.name || "Site"}</span>
          )}
        </Link>
        <nav className="flex-1">
          <ul className="flex items-center gap-4">
            {(nb?.items || []).map((it:any, i:number) => (
              <li key={i}>
                {it.external ? (
                  <a href={it.href} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">{it.label}</a>
                ) : (
                  <Link href={it.href} className="text-sm hover:underline">{it.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          {(nb?.ctas || []).map((c:any, i:number)=> (
            c.external ? (
              <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded bg-red-600 text-white text-sm">{c.label}</a>
            ) : (
              <Link key={i} href={c.href} className="px-3 py-1.5 rounded bg-red-600 text-white text-sm">{c.label}</Link>
            )
          ))}
        </div>
      </div>
    </header>
  );
}
