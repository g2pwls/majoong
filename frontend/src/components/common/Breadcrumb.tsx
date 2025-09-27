// components/common/Breadcrumb.tsx
import Link from 'next/link';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

// 홈 아이콘 SVG 컴포넌트
const HomeIcon = () => (
  <svg 
    className="w-4 h-4" 
    fill="currentColor" 
    viewBox="0 0 20 20" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);
 
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
            <span className="mx-2 text-gray-500">{">"}</span>
          )}
          {item.href ? (
            <Link href={item.href} className="hover:text-black flex items-center gap-1">
              {idx === 0 ? <HomeIcon /> : item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium flex items-center gap-1">
              {idx === 0 ? <HomeIcon /> : item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
