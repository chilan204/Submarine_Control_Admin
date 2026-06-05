import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { Role, RoleFormData } from "./types";

const EMPTY_FORM: RoleFormData = { code: "", priority: 1 };

export function RoleModal({
  mode, role, onSave, onClose,
}: { mode: "add" | "edit"; role?: Role; onSave: (data: RoleFormData) => void; onClose: () => void }) {
  const [form, setForm] = useState<RoleFormData>(
    role ? { code: role.code, priority: role.priority } : EMPTY_FORM
  );

  const set = (k: keyof RoleFormData, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const inputClass = "w-full bg-[#0d2040] border border-[#4488ff]/25 rounded-lg px-3 py-2 text-white placeholder-[#4466aa]/40 focus:outline-none focus:border-[#4488ff]/60 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#0a1628] border border-[#00ffaa]/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>
            {mode === "add" ? "Thêm vai trò mới" : "Chỉnh sửa vai trò"}
          </h3>
          <button onClick={onClose} className="text-[#8899aa] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[#8899aa] mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}>MÃ VAI TRÒ (CODE)</label>
            <input className={inputClass} style={{ fontSize: "0.875rem", fontFamily: "monospace", textTransform: "uppercase" }} placeholder="VD: ADMIN, OFFICER_1" value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className="block text-[#8899aa] mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}>MỨC ĐỘ ƯU TIÊN</label>
            <input type="number" min="0" className={inputClass} style={{ fontSize: "0.875rem" }} placeholder="1" value={form.priority} onChange={(e) => set("priority", parseInt(e.target.value) || 0)} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#8899aa]/20 text-[#8899aa] hover:border-[#8899aa]/40 transition-all" style={{ fontSize: "0.875rem" }}>
            Hủy
          </button>
          <button onClick={() => onSave(form)} className="flex-1 py-2 rounded-xl bg-[#00ffaa] text-[#030d1a] hover:bg-[#00dd99] transition-all" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
            {mode === "add" ? "Thêm vai trò" : "Lưu thay đổi"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
