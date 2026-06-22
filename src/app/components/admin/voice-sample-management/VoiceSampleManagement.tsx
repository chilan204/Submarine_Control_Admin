import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Trash2, Upload, Mic } from "lucide-react";
import { toast } from "sonner";
import { VoiceSampleItem } from "./types";
import { UploadModal } from "./UploadModal";

function formatDuration(s: number | null) {
  if (s == null) return "—";
  return `${s.toFixed(1)}s`;
}

export function VoiceSampleManagement() {
  const [samples, setSamples] = useState<VoiceSampleItem[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const fetchSamples = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/voice-samples", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setSamples(
          json.data.map((item: any) => {
            const userName = item.userName || `User #${item.userId}`;
            const parts = userName.split(" ");
            const initials =
              parts.length > 1
                ? (
                  parts[0][0] + parts[parts.length - 1][0]
                ).toUpperCase()
                : userName.substring(0, 2).toUpperCase();
            return {
              id: item.id.toString(),
              userId: item.userId.toString(),
              userName,
              userInitials: initials,
              fileName: item.fileName || item.filePath || "—",
              filePath: item.filePath,
              duration: item.duration,
              active: item.active,
            };
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setUsers(
          json.data.map((u: any) => ({ id: u.id.toString(), name: u.name }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSamples();
    fetchUsers();
  }, []);

  const filtered = samples.filter(
    (s) =>
      s.userName.toLowerCase().includes(search.toLowerCase()) ||
      s.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const deleteSample = async (userId: string) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/voice-samples/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        toast.success("Xóa mẫu giọng nói thành công");
        fetchSamples();
      } else {
        toast.error("Xóa mẫu giọng nói thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleUpload = async (userId: string, file: File) => {
    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `http://localhost:8080/api/voice-samples/${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (res.ok) {
        toast.success("Tải lên mẫu giọng nói thành công");
        fetchSamples();
        setShowUpload(false);
      } else {
        toast.error("Tải lên mẫu giọng nói thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const toggleActive = async (userId: string) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/voice-samples/${userId}/toggle-active`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        toast.success("Cập nhật trạng thái thành công");
        fetchSamples();
      } else {
        toast.error("Cập nhật trạng thái thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const activeCount = samples.filter((s) => s.active).length;

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Tổng mẫu giọng nói", count: samples.length, color: "#8899aa" },
          { label: "Đang hoạt động", count: activeCount, color: "#00ffaa" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#0a1628]/75 border border-[#00ffaa]/10 rounded-xl p-3 text-center backdrop-blur-md"
          >
            <div
              style={{
                color: s.color,
                fontSize: "1.4rem",
                fontWeight: 700,
                fontFamily: "monospace",
              }}
            >
              {s.count}
            </div>
            <div className="text-[#8899aa]" style={{ fontSize: "0.72rem" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-[#0a1628]/75 border border-[#00ffaa]/10 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899aa]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm mẫu hoặc người dùng..."
              className="w-full bg-[#0d2040] border border-[#4488ff]/20 rounded-lg pl-9 pr-4 py-2 text-white placeholder-[#8899aa]/50 focus:outline-none focus:border-[#4488ff]/50 transition-colors"
              style={{ fontSize: "0.875rem" }}
            />
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00ffaa] text-[#030d1a] hover:bg-[#00dd99] transition-all"
            style={{ fontSize: "0.875rem", fontWeight: 700 }}
          >
            <Upload className="w-4 h-4" />
            Tải lên mẫu giọng nói
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0a1628]/75 border border-[#00ffaa]/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#00ffaa]/10">
                {[
                  "Người dùng",
                  "Tên file",
                  "Thời lượng",
                  "Kích hoạt",
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[#8899aa]"
                    style={{
                      fontSize: "0.72rem",
                      letterSpacing: "0.12em",
                      fontWeight: 500,
                    }}
                  >
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00ffaa]/5">
              <AnimatePresence>
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-[#050f1e]/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#4488ff]/10 border border-[#4488ff]/20 flex items-center justify-center flex-shrink-0">
                          <span
                            className="text-[#4488ff]"
                            style={{ fontSize: "0.55rem", fontWeight: 700 }}
                          >
                            {s.userInitials}
                          </span>
                        </div>
                        <div>
                          <p
                            className="text-white"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {s.userName}
                          </p>
                          <p
                            className="text-[#8899aa]"
                            style={{ fontSize: "0.68rem" }}
                          >
                            ID: {s.userId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p
                        className="text-white"
                        style={{ fontSize: "0.8rem", fontWeight: 500 }}
                      >
                        {s.fileName}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[#8899aa]">
                        <Mic className="w-3.5 h-3.5" />
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontFamily: "monospace",
                          }}
                        >
                          {formatDuration(s.duration)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(s.userId)}
                        className={`w-11 h-6 rounded-full border transition-all relative flex-shrink-0 ${s.active ? "bg-[#00ffaa]/15 border-[#00ffaa]/40" : "bg-[#0d2040] border-[#8899aa]/25"}`}>
                        <span className={`absolute top-1 w-4 h-4 rounded-full transition-all ${s.active ? "left-6 bg-[#00ffaa]" : "left-1 bg-[#8899aa]"}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteSample(s.userId)}
                          className="p-1.5 rounded-lg border border-red-400/20 text-red-400/70 hover:bg-red-400/10 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div
              className="text-center py-10 text-[#8899aa]"
              style={{ fontSize: "0.875rem" }}
            >
              Không tìm thấy mẫu giọng nói nào
            </div>
          )}
        </div>
        <div
          className="px-4 py-3 border-t border-[#00ffaa]/8 text-[#8899aa]"
          style={{ fontSize: "0.72rem" }}
        >
          Hiển thị {filtered.length}/{samples.length} mẫu giọng nói
        </div>
      </div>

      <AnimatePresence>
        {showUpload && (
          <UploadModal
            users={users}
            onUpload={handleUpload}
            onClose={() => setShowUpload(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
