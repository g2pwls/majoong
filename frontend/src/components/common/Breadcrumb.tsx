// components/common/Breadcrumb.tsx
type BreadcrumbItem = {
  label: string;
  href?: string;
};
 
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center">
          {idx !== 0 && (
            <span className="mx-2 text-gray-300">{">"}</span>
          )}
          {item.href ? (
            <a href={item.href} className="hover:text-black">
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
