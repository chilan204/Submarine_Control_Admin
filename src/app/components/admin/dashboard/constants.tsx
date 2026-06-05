import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export const CHART_TOOLTIP_STYLE = {
  contentStyle: { background: "#0a1628", border: "1px solid rgba(0,255,170,0.2)", borderRadius: "8px", color: "#fff" },
  labelStyle: { color: "#8899aa" },
};

export const statusCfg = {
  success: { icon: <CheckCircle className="w-3.5 h-3.5" />, color: "#00ffaa" },
  warning: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "#ffaa00" },
  error: { icon: <XCircle className="w-3.5 h-3.5" />, color: "#ff4444" },
};

export const roleBadge: Record<string, string> = {
  ADMIN: "bg-[#00ffaa]/10 text-[#00ffaa] border-[#00ffaa]/20",
  OFFICER_1: "bg-[#4488ff]/10 text-[#4488ff] border-[#4488ff]/20",
  OFFICER_2: "bg-[#ff4444]/10 text-[#ff4444] border-[#ff4444]/20",
  OFFICER_3: "bg-[#ffaa00]/10 text-[#ffaa00] border-[#ffaa00]/20",
  OFFICER_4: "bg-[#8899aa]/10 text-[#8899aa] border-[#8899aa]/20",
  OFFICER_5: "bg-[#bb44ff]/10 text-[#bb44ff] border-[#bb44ff]/20",
};

export const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
