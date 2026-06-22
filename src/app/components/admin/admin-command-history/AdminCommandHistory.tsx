import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Search } from "lucide-react";

import { STAT_TABS, TABLE_HEADERS } from "./constants";
import { FilterStatus, HistoryEntry } from "./types";
import { HistoryRow } from "./HistoryRow";

function mapHistory(item: any): HistoryEntry {
    const userName = item.user?.name || "Unknown";
    const nameParts = userName.split(" ");
    const initials = nameParts.length > 1
        ? (nameParts[0][0] + nameParts.at(-1)![0]).toUpperCase()
        : userName.slice(0, 2).toUpperCase();

    let response = item.commandStatus || "Command processed";

    if (item.action) {
        response += ` [Action: ${item.action}${item.direction ? ` ${item.direction}` : ""}${item.value ? ` ${item.value}` : ""}]`;
    }

    return {
        id: String(item.id),
        userId: String(item.user?.id || ""),
        userName,
        userInitials: initials,
        userRole: item.user?.roleCode || "UNKNOWN",
        command: item.transcript || item.action || "Unknown command",
        status: item.executed && item.commandStatus === "EXECUTED" ? "success" : "error",
        response,
        timestamp: new Date(item.createdDate),
    };
}

export function AdminCommandHistory() {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
    const [userFilter, setUserFilter] = useState("all");

    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const res = await fetch(
                    "http://localhost:8080/api/user-session",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const json = await res.json();

                if (res.ok && json.data) {
                    const mapped = json.data
                        .map(mapHistory)
                        .sort(
                            (a: any, b: any) =>
                                b.timestamp.getTime() - a.timestamp.getTime()
                        );

                    setHistory(mapped);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const uniqueUsers = useMemo(
        () => [...new Set(history.map((h) => h.userName))],
        [history]
    );

    const filtered = useMemo(() => {
        const keyword = search.toLowerCase();

        return history.filter((h) => {
            const matchSearch =
                h.command.toLowerCase().includes(keyword) ||
                h.userName.toLowerCase().includes(keyword) ||
                h.response.toLowerCase().includes(keyword);

            const matchStatus =
                statusFilter === "all" || h.status === statusFilter;

            const matchUser =
                userFilter === "all" || h.userName === userFilter;

            return matchSearch && matchStatus && matchUser;
        });
    }, [history, search, statusFilter, userFilter]);

    const counts = useMemo(
        () => ({
            all: history.length,
            success: history.filter((h) => h.status === "success").length,
            error: history.filter((h) => h.status === "error").length,
        }),
        [history]
    );

    if (loading) {
        return (
            <div className="text-center py-10 text-[#8899aa]">
                Đang tải dữ liệu...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {STAT_TABS.map(({ key, label, color }) => (
                    <button
                        key={key}
                        onClick={() => setStatusFilter(key as FilterStatus)}
                        className="bg-[#0a1628]/75 border rounded-xl p-3 text-center backdrop-blur-md transition-all"
                        style={{
                            borderColor:
                                statusFilter === key
                                    ? color
                                    : "rgba(0,255,170,0.1)",
                            boxShadow:
                                statusFilter === key
                                    ? `0 0 12px ${color}18`
                                    : "none",
                        }}
                    >
                        <div
                            style={{
                                color,
                                fontSize: "1.4rem",
                                fontWeight: 700,
                                fontFamily: "monospace",
                            }}
                        >
                            {counts[key]}
                        </div>

                        <div className="text-[#8899aa] text-xs">{label}</div>
                    </button>
                ))}
            </div>

            <div className="bg-[#0a1628]/75 border border-[#00ffaa]/10 rounded-2xl p-4 backdrop-blur-md">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899aa]" />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm..."
                            className="w-full bg-[#0d2040] border border-[#4488ff]/20 rounded-lg pl-9 pr-4 py-2 text-white"
                        />
                    </div>

                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="bg-[#0d2040] border border-[#4488ff]/20 rounded-lg px-3 py-2 text-[#8899aa] focus:outline-none focus:ring-0 focus:border-[#4488ff]/50"
                    >
                        <option value="all">Tất cả</option>
                        {uniqueUsers.map((u) => (
                            <option key={u} value={u}>
                                {u}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-[#0a1628]/75 border border-[#00ffaa]/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                        <thead>
                            <tr className="border-b border-[#00ffaa]/10">
                                {TABLE_HEADERS.map((header) => (
                                    <th
                                        key={header}
                                        className="px-4 py-3 text-left text-[#8899aa]"
                                        style={{
                                            width:
                                                header === "Người dùng"
                                                    ? "25%"
                                                    : header === "Lệnh"
                                                        ? "40%"
                                                        : header === "Trạng thái"
                                                            ? "15%"
                                                            : header === "Thời điểm"
                                                                ? "20%"
                                                                : "40px",
                                        }}
                                    >
                                        {header.toUpperCase()}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#00ffaa]/5">
                            <AnimatePresence>
                                {filtered.map((entry, i) => (
                                    <HistoryRow
                                        key={entry.id}
                                        entry={entry}
                                        isOpen={expandedId === entry.id}
                                        delay={i * 0.02}
                                        onToggle={() =>
                                            setExpandedId(
                                                expandedId === entry.id ? null : entry.id
                                            )
                                        }
                                    />
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div className="text-center py-10 text-[#8899aa]">
                            Không tìm thấy bản ghi nào
                        </div>
                    )}
                </div>

                <div className="px-4 py-3 border-t border-[#00ffaa]/8 flex justify-between">
                    <span className="text-[#8899aa] text-xs">
                        Hiển thị {filtered.length}/{history.length} bản ghi
                    </span>

                    <span className="text-[#00ffaa]/50 text-xs">
                        Tự động ghi nhận
                    </span>
                </div>
            </div>
        </div>
    );
}