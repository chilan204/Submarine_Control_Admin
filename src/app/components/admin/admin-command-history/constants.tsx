import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { CmdStatus } from "./types";

export const TABLE_HEADERS = [
    "Người dùng",
    "Lệnh",
    "Trạng thái",
    "Thời điểm",
    "",
];

export const STATUS_CFG: Record<
    CmdStatus,
    {
        icon: React.ReactNode;
        color: string;
        label: string;
        rowBg: string;
    }
> = {
    success: {
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        color: "#00ffaa",
        label: "Thành công",
        rowBg: "",
    },
    error: {
        icon: <XCircle className="w-3.5 h-3.5" />,
        color: "#ff4444",
        label: "Lỗi",
        rowBg: "bg-red-400/2",
    },
};

export const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Quản trị viên",
    OFFICER_5: "Sĩ quan 5",
    OFFICER_4: "Sĩ quan 4",
    OFFICER_3: "Sĩ quan 3",
    OFFICER_2: "Sĩ quan 2",
    OFFICER_1: "Sĩ quan 1",
};

export const STAT_TABS: {
    key: "all" | "success" | "error";
    label: string;
    color: string;
}[] = [
        { key: "all", label: "Tất cả", color: "#8899aa" },
        { key: "success", label: "Thành công", color: "#00ffaa" },
        { key: "error", label: "Lỗi", color: "#ff4444" },
    ];