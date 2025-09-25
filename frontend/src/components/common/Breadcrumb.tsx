// components/common/Breadcrumb.tsx
import Link from 'next/link';

type BreadcrumbItem = {
  label: string;
  href?: string;
};
 
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  // 홈 링크를 맨 앞에 추가
  const allItems = [
    { label: '홈', href: '/' },
    ...items
  ];

  return (
    <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
      {allItems.map((item, idx) => (
        <div key={idx} className="flex items-center">
          {idx !== 0 && (
            <span className="mx-2 text-gray-300">{">"}</span>
          )}
          {item.href ? (
            <Link href={item.href} className="hover:text-black">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
