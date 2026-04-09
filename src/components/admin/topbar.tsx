import { logout } from "@/app/(admin)/login/actions";

interface TopbarProps {
  userName: string;
  userRole: string;
}

export function Topbar({ userName, userRole }: TopbarProps) {
  return (
    <header className="h-14 bg-white flex items-center justify-between px-6" style={{ borderBottom: "1px solid #e5edf5" }}>
      <div />
      <div className="flex items-center gap-4">
        <span className="text-xs font-normal px-2 py-0.5 rounded-[4px] capitalize" style={{ color: "#1a6bb5", backgroundColor: "#e8f4fd", border: "1px solid #c5e2f9" }}>
          {userRole}
        </span>
        <span className="text-sm" style={{ color: "#0a1628" }}>{userName}</span>
        <form action={logout}>
          <button type="submit" className="text-sm transition-colors" style={{ color: "#64748d" }}>
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
