"use client";

export default function MobileDashboard({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <>
      {/* Background overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 text-lg font-semibold border-b">Dashboard</div>

        <div className="p-4 space-y-3">
          <a className="block hover:text-blue-500" href="/">
            Home
          </a>
          <a className="block hover:text-blue-500" href="/tasks">
            Tasks
          </a>
          <a className="block hover:text-blue-500" href="/gamify">
            Gamify
          </a>
        </div>
      </div>
    </>
  );
}
