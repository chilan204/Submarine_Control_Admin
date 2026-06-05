import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Role, RoleFormData } from "./types";
import { RoleModal } from "./RoleModal";
import { DeleteModal } from "./DeleteModal";

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/roles", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setRoles(data.data.map((r: any) => ({
          id: r.id.toString(),
          code: r.code,
          priority: r.priority
        })).sort((a: Role, b: Role) => a.priority - b.priority));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filtered = roles.filter((r) => r.code.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (data: RoleFormData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchRoles();
        setModal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (data: RoleFormData) => {
    if (!selectedRole) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/roles/${selectedRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchRoles();
        setModal(null);
        setSelectedRole(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/roles/${selectedRole.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRoles();
        setModal(null);
        setSelectedRole(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Tổng số vai trò", count: roles.length, color: "#8899aa" },
          { label: "Mức độ ưu tiên cao nhất", count: roles.filter(r => r.priority === 1).length, color: "#00ffaa" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a1628]/75 border border-[#00ffaa]/10 rounded-xl p-3 text-center backdrop-blur-md">
            <div style={{ color: s.color, fontSize: "1.4rem", fontWeight: 700, fontFamily: "monospace" }}>{s.count}</div>
            <div className="text-[#8899aa]" style={{ fontSize: "0.72rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-[#0a1628]/75 border border-[#00ffaa]/10 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899aa]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm mã vai trò..."
              className="w-full bg-[#0d2040] border border-[#4488ff]/20 rounded-lg pl-9 pr-4 py-2 text-white placeholder-[#8899aa]/50 focus:outline-none focus:border-[#4488ff]/50 transition-colors"
              style={{ fontSize: "0.875rem" }} />
          </div>
          <button onClick={() => setModal("add")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00ffaa] text-[#030d1a] hover:bg-[#00dd99] transition-all"
            style={{ fontSize: "0.875rem", fontWeight: 700 }}>
            <Plus className="w-4 h-4" />
            Thêm vai trò
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0a1628]/75 border border-[#00ffaa]/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#00ffaa]/10">
                {["Mã vai trò (Code)", "Mức độ ưu tiên", "Thao tác"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[#8899aa]" style={{ fontSize: "0.72rem", letterSpacing: "0.12em", fontWeight: 500 }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00ffaa]/5">
              <AnimatePresence>
                {filtered.map((role, i) => (
                  <motion.tr key={role.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-[#050f1e]/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[0.8rem] font-mono border border-[#4488ff]/30 bg-[#4488ff]/10 text-[#4488ff]">
                        {role.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#00ffaa] font-mono" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{role.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedRole(role); setModal("edit"); }}
                          className="p-1.5 rounded-lg border border-[#4488ff]/20 text-[#4488ff]/70 hover:bg-[#4488ff]/10 hover:text-[#4488ff] transition-all">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setSelectedRole(role); setModal("delete"); }}
                          className="p-1.5 rounded-lg border border-red-400/20 text-red-400/70 hover:bg-red-400/10 hover:text-red-400 transition-all">
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
            <div className="text-center py-10 text-[#8899aa]" style={{ fontSize: "0.875rem" }}>Không tìm thấy vai trò nào</div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-[#00ffaa]/8 text-[#8899aa]" style={{ fontSize: "0.72rem" }}>
          Hiển thị {filtered.length}/{roles.length} vai trò
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal === "add" && <RoleModal mode="add" onSave={handleAdd} onClose={() => setModal(null)} />}
        {modal === "edit" && selectedRole && <RoleModal mode="edit" role={selectedRole} onSave={handleEdit} onClose={() => { setModal(null); setSelectedRole(null); }} />}
        {modal === "delete" && selectedRole && <DeleteModal role={selectedRole} onConfirm={handleDelete} onClose={() => { setModal(null); setSelectedRole(null); }} />}
      </AnimatePresence>
    </div>
  );
}
