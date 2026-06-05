import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { CommandCfg, CommandFormData } from "./types";

const EMPTY_FORM: CommandFormData = {
    keyword: "",
    action: "",
    direction: "",
    hasValue: false,
    active: true,
};

export function CommandModal({
    mode, cmd, onSave, onClose,
}: { mode: "add" | "edit"; cmd?: CommandCfg; onSave: (d: CommandFormData) => void; onClose: () => void }) {
    const [form, setForm] = useState<CommandFormData>(
        cmd ? { keyword: cmd.keyword, action: cmd.action, direction: cmd.direction || "", hasValue: cmd.hasValue, active: cmd.active } : EMPTY_FORM
    );
    const set = <K extends keyof CommandFormData>(k: K, v: CommandFormData[K]) => setForm((f) => ({ ...f, [k]: v }));

    const inputClass = "w-full bg-[#0d2040] border border-[#4488ff]/25 rounded-lg px-3 py-2 text-white placeholder-[#4466aa]/40 focus:outline-none focus:border-[#4488ff]/60 transition-colors";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#0a1628] border border-[#00ffaa]/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>{mode === "add" ? "Thêm lệnh" : "Chỉnh sửa lệnh"}</h3>
                    <button onClick={onClose} className="text-[#8899aa] hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="block text-[#8899aa] mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}>TỪ KHÓA</label>
                        <input className={inputClass} style={{ fontSize: "0.875rem" }} placeholder="Lặn xuống" value={form.keyword} onChange={(e) => set("keyword", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[#8899aa] mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}>HÀNH ĐỘNG</label>
                            <input className={inputClass} style={{ fontSize: "0.875rem" }} placeholder="dive" value={form.action} onChange={(e) => set("action", e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[#8899aa] mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}>HƯỚNG</label>
                            <input className={inputClass} style={{ fontSize: "0.875rem" }} placeholder="down" value={form.direction} onChange={(e) => set("direction", e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[#8899aa]" style={{ fontSize: "0.8rem" }}>Kèm theo giá trị</span>
                            <button onClick={() => set("hasValue", !form.hasValue)}
                                className={`w-10 h-5 rounded-full border transition-all relative ${form.hasValue ? "bg-[#ffaa00]/20 border-[#ffaa00]/40" : "bg-[#0d2040] border-[#8899aa]/20"}`}>
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${form.hasValue ? "left-5 bg-[#ffaa00]" : "left-0.5 bg-[#8899aa]"}`} />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[#8899aa]" style={{ fontSize: "0.8rem" }}>Kích hoạt</span>
                            <button onClick={() => set("active", !form.active)}
                                className={`w-10 h-5 rounded-full border transition-all relative ${form.active ? "bg-[#00ffaa]/20 border-[#00ffaa]/40" : "bg-[#0d2040] border-[#8899aa]/20"}`}>
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${form.active ? "left-5 bg-[#00ffaa]" : "left-0.5 bg-[#8899aa]"}`} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#8899aa]/20 text-[#8899aa] hover:border-[#8899aa]/40 transition-all" style={{ fontSize: "0.875rem" }}>Hủy</button>
                    <button onClick={() => onSave(form)} className="flex-1 py-2 rounded-xl bg-[#00ffaa] text-[#030d1a] hover:bg-[#00dd99] transition-all" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                        {mode === "add" ? "Thêm lệnh" : "Lưu thay đổi"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
