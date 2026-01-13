import type { Metadata } from 'next';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, FolderTree, Settings, Menu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage your furniture store',
};

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FolderTree, label: 'Danh mục', href: '/admin/categories' },
  { icon: ShoppingBag, label: 'Sản phẩm', href: '/admin/products' },
  { icon: Settings, label: 'Cài đặt', href: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-blue-600">Furniture Admin</Link>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:hidden">
          <button className="p-2 text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-bold text-lg">Furniture Admin</span>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
