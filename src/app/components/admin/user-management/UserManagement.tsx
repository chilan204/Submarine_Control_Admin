import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { User, UserFormData } from "./types";
import { ROLE_LABELS, ROLE_COLORS } from "./constants";
import { initials } from "./utils";
import { UserModal } from "./UserModal";
import { DeleteModal } from "./DeleteModal";

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | "All">("All");
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/user", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setUsers(data.data.map((u: any) => ({
          id: u.id.toString(),
          name: u.name,
          username: u.username,
          email: u.email,
          phone: u.phone,
          roleCode: u.roleCode
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    return matchSearch && (roleFilter === "All" || u.roleCode === roleFilter);
  });

  const handleAdd = async (data: UserFormData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchUsers();
        setModal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (data: UserFormData) => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem("token");
      const payload = { ...data };
      if (!payload.password) {
        payload.password = "dummyPassword"; // dummy to pass validation
      }

      const res = await fetch(`http://localhost:8080/api/user/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchUsers();
        setModal(null);
        setSelectedUser(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/user/${selectedUser.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
        setModal(null);
        setSelectedUser(null);
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
          { label: "Tổng số", count: users.length, color: "#8899aa" },
          { label: "Quản trị viên", count: users.filter(u => u.roleCode === "ADMIN").length, color: "#00ffaa" },
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
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm người dùng..."
              className="w-full bg-[#0d2040] border border-[#4488ff]/20 rounded-lg pl-9 pr-4 py-2 text-white placeholder-[#8899aa]/50 focus:outline-none focus:border-[#4488ff]/50 transition-colors"
              style={{ fontSize: "0.875rem" }} />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0d2040] border border-[#4488ff]/20 rounded-lg px-3 py-2 text-[#8899aa] focus:outline-none focus:border-[#4488ff]/50 transition-colors cursor-pointer"
            style={{ fontSize: "0.875rem" }}>
            <option value="All">Tất cả vai trò</option>
            {Object.entries(ROLE_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
          <button onClick={() => setModal("add")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00ffaa] text-[#030d1a] hover:bg-[#00dd99] transition-all"
            style={{ fontSize: "0.875rem", fontWeight: 700 }}>
            <Plus className="w-4 h-4" />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0a1628]/75 border border-[#00ffaa]/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#00ffaa]/10">
                {["Người dùng", "Email", "Số điện thoại", "Vai trò", "Thao tác"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[#8899aa]" style={{ fontSize: "0.72rem", letterSpacing: "0.12em", fontWeight: 500 }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00ffaa]/5">
              <AnimatePresence>
                {filtered.map((user, i) => {
                  const roleLabel = ROLE_LABELS[user.roleCode] || user.roleCode;
                  const roleStyle = ROLE_COLORS[user.roleCode] || ROLE_COLORS["OFFICER_1"];
                  return (
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-[#050f1e]/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#00ffaa]/10 border border-[#00ffaa]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#00ffaa]" style={{ fontSize: "0.65rem", fontWeight: 700 }}>{initials(user.name)}</span>
                          </div>
                          <div>
                            <p className="text-white" style={{ fontSize: "0.85rem" }}>{user.name}</p>
                            <p className="text-[#8899aa]" style={{ fontSize: "0.72rem", fontFamily: "monospace" }}>{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#8899aa]" style={{ fontSize: "0.8rem" }}>{user.email || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#8899aa]" style={{ fontSize: "0.8rem" }}>{user.phone || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[0.72rem] border ${roleStyle}`}>{roleLabel}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setSelectedUser(user); setModal("edit"); }}
                            className="p-1.5 rounded-lg border border-[#4488ff]/20 text-[#4488ff]/70 hover:bg-[#4488ff]/10 hover:text-[#4488ff] transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { setSelectedUser(user); setModal("delete"); }}
                            className="p-1.5 rounded-lg border border-red-400/20 text-red-400/70 hover:bg-red-400/10 hover:text-red-400 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-[#8899aa]" style={{ fontSize: "0.875rem" }}>Không tìm thấy người dùng nào</div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-[#00ffaa]/8 text-[#8899aa]" style={{ fontSize: "0.72rem" }}>
          Hiển thị {filtered.length}/{users.length} người dùng
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal === "add" && <UserModal mode="add" onSave={handleAdd} onClose={() => setModal(null)} />}
        {modal === "edit" && selectedUser && <UserModal mode="edit" user={selectedUser} onSave={handleEdit} onClose={() => { setModal(null); setSelectedUser(null); }} />}
        {modal === "delete" && selectedUser && <DeleteModal user={selectedUser} onConfirm={handleDelete} onClose={() => { setModal(null); setSelectedUser(null); }} />}
      </AnimatePresence>
    </div>
  );
}
