export type CmdStatus = "success" | "warning" | "error";

export interface HistoryEntry {
    id: string;
    userId: string;
    userName: string;
    userInitials: string;
    userRole: string;
    command: string;
    status: CmdStatus;
    response: string;
    timestamp: Date;
}

export type FilterStatus = "all" | "success" | "warning" | "error";
