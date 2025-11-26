export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r bg-white p-4">
      <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
      <nav className="space-y-3">
        <a href="/dashboard" className="hover:text-blue-500">
          Home
        </a>
        <a href="/analytics" className="hover:text-blue-500">
          Analytics
        </a>
        <a href="/settings" className="hover:text-blue-500">
          Settings
        </a>
      </nav>
    </aside>
  );
}
