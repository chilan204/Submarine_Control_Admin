import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Upload, X } from "lucide-react";

export function UploadModal({
  users,
  onUpload,
  onClose,
}: {
  users: { id: string; name: string }[];
  onUpload: (userId: string, file: File) => void;
  onClose: () => void;
}) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || "");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputClass =
    "w-full bg-[#0d2040] border border-[#4488ff]/25 rounded-lg px-3 py-2 text-white placeholder-[#4466aa]/40 focus:outline-none focus:border-[#4488ff]/60 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#0a1628] border border-[#00ffaa]/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3
            className="text-white"
            style={{ fontSize: "1rem", fontWeight: 600 }}
          >
            Tải lên mẫu giọng nói
          </h3>
          <button onClick={onClose} className="text-[#8899aa] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label
              className="block text-[#8899aa] mb-1"
              style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}
            >
              NGƯỜI DÙNG
            </label>
            <select
              className={`${inputClass} cursor-pointer`}
              style={{ fontSize: "0.875rem" }}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} (ID: {u.id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-[#8899aa] mb-1"
              style={{ fontSize: "0.72rem", letterSpacing: "0.1em" }}
            >
              FILE ÂM THANH (.WAV)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#0d2040] border border-dashed border-[#4488ff]/25 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-[#4488ff]/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".wav,audio/wav"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <div>
                  <p className="text-white" style={{ fontSize: "0.875rem" }}>
                    {file.name}
                  </p>
                  <p
                    className="text-[#8899aa]"
                    style={{ fontSize: "0.72rem" }}
                  >
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="w-6 h-6 text-[#4488ff]/50 mx-auto mb-2" />
                  <p
                    className="text-[#8899aa]"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Nhấp để chọn file âm thanh
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-[#8899aa]/20 text-[#8899aa] hover:border-[#8899aa]/40 transition-all"
            style={{ fontSize: "0.875rem" }}
          >
            Hủy
          </button>
          <button
            onClick={() => {
              if (selectedUserId && file) onUpload(selectedUserId, file);
            }}
            disabled={!selectedUserId || !file}
            className="flex-1 py-2 rounded-xl bg-[#00ffaa] text-[#030d1a] hover:bg-[#00dd99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontSize: "0.875rem", fontWeight: 700 }}
          >
            Tải lên
          </button>
        </div>
      </motion.div>
    </div>
  );
}
