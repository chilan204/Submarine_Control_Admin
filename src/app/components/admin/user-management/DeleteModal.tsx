import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { User } from "./types";

export function DeleteModal({ user, onConfirm, onClose }: { user: User; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#0a1628] border border-red-400/25 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-400/10 border border-red-400/25 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
        </div>
        <h3 className="text-white text-center mb-1" style={{ fontSize: "1rem", fontWeight: 600 }}>Xóa Người Dùng</h3>
        <p className="text-[#8899aa] text-center mb-5" style={{ fontSize: "0.85rem" }}>
          Bạn có chắc chắn muốn xóa <span className="text-white">{user.name}</span>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#8899aa]/20 text-[#8899aa] hover:border-[#8899aa]/40 transition-all" style={{ fontSize: "0.875rem" }}>Hủy</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white transition-all" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Xóa</button>
        </div>
      </motion.div>
    </div>
  );
}
