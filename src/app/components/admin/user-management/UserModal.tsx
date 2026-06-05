import { useState } from "react";
import { motion } from "motion/react";
import { X, Eye, EyeOff } from "lucide-react";
import { User, UserFormData } from "./types";
import { ROLE_LABELS } from "./constants";

const EMPTY_FORM: UserFormData = { name: "", username: "", email: "", phone: "", roleCode: "OFFICER_1", password: "" };

export function UserModal({
  mode, user, onSave, onClose,
}: { mode: "add" | "edit"; user?: User; onSave: (data: UserFormData) => void; onClose: () => void }) {
  const [form, setForm] = useState<UserFormData>(
    user ? { name: user.name, username: user.username, email: user.email, phone: user.phone || "", roleCode: user.roleCode, password: "" } : EMPTY_FORM
  );
  const [showPw, setShowPw] = useState(false);

  const set = (k: keyof UserFormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const inputClass = "w-full bg-[#0d2040] border border-[#4488ff]/25 rounded-lg px-3 py-2 text-white placeholder-[#4466aa]/40 focus:outline-none focus:border-[#4488ff]/60 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#0a1628] border border-[#00ffaa]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>
            {mode === "add" ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"}
          </h3>
          <button onClick={onClose} className="text-[#8899aa] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[#8899aa] mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}>HỌ VÀ TÊN</label>
            <input className={inputClass} style={{ fontSize: "0.875rem" }} placeholder="Nguyễn Văn A" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8899aa] mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}>TÊN ĐĂNG NHẬP</label>
              <input className={inputClass} style={{ fontSize: "0.875rem", fontFamily: "monospace" }} placeholder="user.name" value={form.username} onChange={(e) => set("username", e.target.value)} />
            </div>
            <div>
              <label className="block text-[#8899aa] mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}>SỐ ĐIỆN THOẠI</label>
              <input className={inputClass} style={{ fontSize: "0.875rem" }} placeholder="0901234567" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8899aa] mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}>EMAIL</label>
              <input className={inputClass} style={{ fontSize: "0.875rem" }} placeholder="name@nauticom.mil" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label className="block text-[#8899aa] mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}>VAI TRÒ</label>
              <select className={`${inputClass} cursor-pointer`} style={{ fontSize: "0.875rem" }} value={form.roleCode} onChange={(e) => set("roleCode", e.target.value)}>
                {Object.entries(ROLE_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[#8899aa] mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}>
              {mode === "edit" ? "MẬT KHẨU MỚI (để trống nếu không đổi)" : "MẬT KHẨU"}
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className={`${inputClass} pr-10`}
                style={{ fontSize: "0.875rem", letterSpacing: "0.1em" }}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4488ff]/40 hover:text-[#4488ff]">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#8899aa]/20 text-[#8899aa] hover:border-[#8899aa]/40 transition-all" style={{ fontSize: "0.875rem" }}>
            Hủy
          </button>
          <button onClick={() => onSave(form)} className="flex-1 py-2 rounded-xl bg-[#00ffaa] text-[#030d1a] hover:bg-[#00dd99] transition-all" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
            {mode === "add" ? "Thêm người dùng" : "Lưu thay đổi"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
