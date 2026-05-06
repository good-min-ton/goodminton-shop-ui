import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: Readonly<PageHeaderProps>) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="text-admin-text-muted mb-3 flex items-center gap-1 text-xs"
        >
          {breadcrumbs.map((c, idx) => (
            <span
              key={`${c.label}-${idx}`}
              className="inline-flex items-center gap-1"
            >
              {idx > 0 && <ChevronRight size={12} />}
              {c.href ? (
                <Link href={c.href} className="hover:text-admin-text">
                  {c.label}
                </Link>
              ) : (
                <span className="text-admin-text">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-admin-text text-3xl font-extrabold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-admin-text-muted mt-1.5 text-sm">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
