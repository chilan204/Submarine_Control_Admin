import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu } from "lucide-react";

import { Sidebar } from "../components/admin/Sidebar";
import { Dashboard } from "../components/admin/dashboard/Dashboard";
import { UserManagement } from "../components/admin/user-management/UserManagement";
import { VoiceSampleManagement } from "../components/admin/voice-sample-management/VoiceSampleManagement";
import { CommandConfig } from "../components/admin/command-config/CommandConfig";
import { AdminCommandHistory } from "../components/admin/admin-command-history/AdminCommandHistory";
import { RoleManagement } from "../components/admin/role-management/RoleManagement";

export type Section =
    | "dashboard"
    | "users"
    | "roles"
    | "voice_samples"
    | "commands"
    | "history";

const SECTION_LABELS: Record<Section, string> = {
    dashboard: "Bảng điều khiển",
    users: "Quản lý người dùng",
    roles: "Quản lý vai trò",
    voice_samples: "Quản lý mẫu giọng nói",
    commands: "Cấu hình lệnh",
    history: "Lịch sử lệnh",
};

interface AdminLayoutProps {
    onLogout: () => void;
}

export default function AdminLayout({ onLogout }: AdminLayoutProps) {
    const [activeSection, setActiveSection] = useState<Section>("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-full overflow-hidden">
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            <div
                className={`fixed lg:relative z-30 h-full transition-transform duration-300 ${sidebarOpen
                    ? "translate-x-0"
                    : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                <Sidebar
                    active={activeSection}
                    onNavigate={(section) => {
                        setActiveSection(section);
                        setSidebarOpen(false);
                    }}
                    onLogout={onLogout}
                />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <div className="flex-shrink-0 bg-[#050f1e]/75 backdrop-blur-md border-b border-[#00ffaa]/10 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-[#8899aa] hover:text-white transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1">
                        <h2
                            className="text-white"
                            style={{
                                fontSize: "1rem",
                                fontWeight: 600,
                            }}
                        >
                            {SECTION_LABELS[activeSection]}
                        </h2>

                        <p
                            className="text-[#8899aa]"
                            style={{
                                fontSize: "0.7rem",
                                fontFamily: "monospace",
                            }}
                        >
                            HỆ THỐNG QUẢN TRỊ •{" "}
                            {new Date().toLocaleDateString(
                                "vi-VN",
                                {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                }
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00ffaa] animate-pulse" />
                        <span
                            className="text-[#00ffaa]/60 hidden sm:inline"
                            style={{
                                fontSize: "0.7rem",
                                fontFamily: "monospace",
                            }}
                        >
                            TRỰC TUYẾN
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {activeSection === "dashboard" && (
                                <Dashboard />
                            )}

                            {activeSection === "users" && (
                                <UserManagement />
                            )}

                            {activeSection === "roles" && (
                                <RoleManagement />
                            )}

                            {activeSection === "voice_samples" && (
                                <VoiceSampleManagement />
                            )}

                            {activeSection === "commands" && (
                                <CommandConfig />
                            )}

                            {activeSection === "history" && (
                                <AdminCommandHistory />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}