import { LayoutDashboard, Users, Mic, Settings, History, LogOut, Anchor, ChevronRight, Shield } from "lucide-react";
import type { Section } from "../../pages/AdminLayout";

interface SidebarProps {
  active: Section;
  onNavigate: (s: Section) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { section: Section; label: string; icon: React.ReactNode; badge?: string }[] = [
  { section: "dashboard", label: "Tổng quan", icon: <LayoutDashboard className="w-5 h-5" /> },
  { section: "users", label: "Quản lý người dùng", icon: <Users className="w-5 h-5" /> },
  { section: "roles", label: "Quản lý vai trò", icon: <Shield className="w-5 h-5" /> },
  { section: "voice_samples", label: "Mẫu giọng nói", icon: <Mic className="w-5 h-5" /> },
  { section: "commands", label: "Cấu hình lệnh", icon: <Settings className="w-5 h-5" /> },
  { section: "history", label: "Lịch sử lệnh", icon: <History className="w-5 h-5" /> },
];

export function Sidebar({ active, onNavigate, onLogout }: SidebarProps) {
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.name || "Quản trị viên";

  return (
    <div
      className="w-60 h-full flex flex-col border-r border-[#00ffaa]/10"
      style={{ background: "rgba(5, 15, 30, 0.92)", backdropFilter: "blur(16px)" }}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#00ffaa]/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00ffaa]/10 border border-[#00ffaa]/30 flex items-center justify-center flex-shrink-0">
            <Anchor className="w-5 h-5 text-[#00ffaa]" />
          </div>
          <div>
            <div
              className="text-white"
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                fontFamily: "monospace",
              }}
            >
              BẢNG ĐIỀU KHIỂN QUẢN TRỊ
            </div>
            {/* <div
              className="text-[#00ffaa]/40"
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                fontFamily: "monospace",
              }}
            >
              BẢNG ĐIỀU KHIỂN QUẢN TRỊ
            </div> */}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p
          className="px-3 mb-3 text-[#8899aa]"
          style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}
        >
          ĐIỀU HƯỚNG
        </p>

        {NAV_ITEMS.map(({ section, label, icon }) => {
          const isActive = active === section;

          return (
            <button
              key={section}
              onClick={() => onNavigate(section)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative"
              style={{
                background: isActive ? "rgba(0,255,170,0.08)" : "transparent",
                border: isActive
                  ? "1px solid rgba(0,255,170,0.2)"
                  : "1px solid transparent",
              }}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#00ffaa] rounded-r-full" />
              )}

              <span
                style={{ color: isActive ? "#00ffaa" : "#8899aa" }}
                className="group-hover:text-white transition-colors"
              >
                {icon}
              </span>

              <span
                className="flex-1 text-left transition-colors"
                style={{
                  color: isActive ? "#00ffaa" : "#8899aa",
                  fontSize: "0.85rem",
                }}
              >
                {label}
              </span>

              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-[#00ffaa]/50" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-[#00ffaa]/10 space-y-1">
        {/* Admin badge */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#00ffaa]/5 border border-[#00ffaa]/10 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#00ffaa]/15 border border-[#00ffaa]/30 flex items-center justify-center flex-shrink-0">
            <span
              className="text-[#00ffaa]"
              style={{ fontSize: "0.7rem", fontWeight: 700 }}
            >
              AD
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-white truncate" style={{ fontSize: "0.8rem", textTransform: "capitalize" }}>
              {userName}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-red-400/10 text-red-400/70 hover:bg-red-400/8 hover:border-red-400/25 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span style={{ fontSize: "0.85rem" }}>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}