import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";

import { HistoryEntry } from "./types";
import { STATUS_CFG, ROLE_LABELS } from "./constants";
import { timeAgo, formatTime } from "./utils";

interface HistoryRowProps {
    entry: HistoryEntry;
    isOpen: boolean;
    delay?: number;
    onToggle: () => void;
}

export function HistoryRow({ entry, isOpen, delay = 0, onToggle }: HistoryRowProps) {
    const { color, icon, label, rowBg } = STATUS_CFG[entry.status];

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay }}
            className={`hover:bg-[#050f1e]/50 transition-colors cursor-pointer ${rowBg}`}
            onClick={onToggle}
        >
            {/* USER */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#00ffaa]/10 border border-[#00ffaa]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#00ffaa] text-[0.55rem] font-bold">
                            {entry.userInitials}
                        </span>
                    </div>

                    <div>
                        <p className="text-white text-[0.8rem]">
                            {entry.userName}
                        </p>

                        <p className="text-[#8899aa] text-[0.65rem]">
                            {ROLE_LABELS[entry.userRole] ?? entry.userRole}
                        </p>
                    </div>
                </div>
            </td>

            {/* COMMAND */}
            <td className="px-4 py-3">
                <p className="text-white text-[0.85rem]">
                    {entry.command}
                </p>

                {isOpen && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[#8899aa] mt-1 overflow-hidden text-[0.75rem]"
                    >
                        {entry.response}
                    </motion.p>
                )}
            </td>

            {/* STATUS */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5" style={{ color }}>
                    {icon}
                    <span className="text-[0.78rem]">{label}</span>
                </div>
            </td>

            {/* TIME */}
            <td className="px-4 py-3">
                <p className="text-[#8899aa] text-[0.75rem]">
                    {timeAgo(entry.timestamp)}
                </p>

                {isOpen && (
                    <p className="text-[#8899aa]/60 text-[0.68rem] font-mono">
                        {formatTime(entry.timestamp)}
                    </p>
                )}
            </td>

            {/* ACTION */}
            <td className="px-4 py-3">
                <ChevronRight className={`w-4 h-4 text-[#8899aa] transition-transform ${isOpen ? "rotate-90" : ""}`} />
            </td>
        </motion.tr>
    );
}