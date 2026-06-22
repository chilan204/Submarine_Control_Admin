import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { CommandCfg, CommandFormData } from "./types";
import { CommandModal } from "./CommandModal";

export function CommandConfig() {
    const [commands, setCommands] = useState<CommandCfg[]>([]);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState<"add" | "edit" | null>(null);
    const [selectedCmd, setSelectedCmd] = useState<CommandCfg | null>(null);

    const fetchCommands = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/command-dictionaries", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.data) {
                setCommands(data.data.map((c: any) => ({
                    id: c.id.toString(),
                    keyword: c.keyword,
                    action: c.action,
                    direction: c.direction,
                    hasValue: c.hasValue,
                    active: c.active
                })));
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCommands();
    }, []);

    const filtered = commands.filter((c) => {
        return c.keyword.toLowerCase().includes(search.toLowerCase()) ||
            c.action.toLowerCase().includes(search.toLowerCase());
    });

    const toggleEnabled = async (cmd: CommandCfg) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/command-dictionaries/${cmd.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ ...cmd, active: !cmd.active })
            });
            if (res.ok) {
                toast.success("Cập nhật trạng thái thành công");
                fetchCommands();
            } else {
                toast.error("Cập nhật trạng thái thất bại");
            }
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi");
        }
    };

    const deleteCmd = async (id: string) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/command-dictionaries/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Xóa lệnh thành công");
                fetchCommands();
            } else {
                toast.error("Xóa lệnh thất bại");
            }
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi");
        }
    };

    const handleAdd = async (d: CommandFormData) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/command-dictionaries", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(d)
            });
            if (res.ok) {
                toast.success("Thêm lệnh thành công");
                fetchCommands();
                setModal(null);
            } else {
                toast.error("Thêm lệnh thất bại");
            }
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi");
        }
    };

    const handleEdit = async (d: CommandFormData) => {
        if (!selectedCmd) return;
        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/command-dictionaries/${selectedCmd.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(d)
            });
            if (res.ok) {
                toast.success("Cập nhật lệnh thành công");
                fetchCommands();
                setModal(null);
                setSelectedCmd(null);
            } else {
                toast.error("Cập nhật lệnh thất bại");
            }
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi");
        }
    };

    const activeCount = commands.filter((c) => c.active).length;

    return (
        <div className="space-y-4">
            {/* Summary row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                    { label: "Tổng số lệnh", count: commands.length, color: "#8899aa" },
                    { label: "Đã bật", count: activeCount, color: "#00ffaa" },
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
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm từ khóa..."
                            className="w-full bg-[#0d2040] border border-[#4488ff]/20 rounded-lg pl-9 pr-4 py-2 text-white placeholder-[#8899aa]/50 focus:outline-none focus:border-[#4488ff]/50 transition-colors"
                            style={{ fontSize: "0.875rem" }} />
                    </div>
                    <button onClick={() => setModal("add")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00ffaa] text-[#030d1a] hover:bg-[#00dd99] transition-all"
                        style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                        <Plus className="w-4 h-4" />
                        Thêm Lệnh
                    </button>
                </div>
            </div>

            {/* Command list */}
            <div className="bg-[#0a1628]/75 border border-[#00ffaa]/10 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#00ffaa]/10">
                                {["Từ khóa", "Hành động", "Hướng", "Có Giá trị", "Kích hoạt", "Thao tác"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-[#8899aa]" style={{ fontSize: "0.72rem", letterSpacing: "0.12em", fontWeight: 500 }}>{h.toUpperCase()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#00ffaa]/5">
                            <AnimatePresence>
                                {filtered.map((cmd, i) => (
                                    <motion.tr key={cmd.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                                        className="hover:bg-[#050f1e]/40 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-white" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{cmd.keyword}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-md text-[0.72rem] border border-[#4488ff]/25 bg-[#4488ff]/8 text-[#4488ff]">{cmd.action}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[#8899aa]" style={{ fontSize: "0.8rem" }}>{cmd.direction || "—"}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {cmd.hasValue ? (
                                                <span className="px-2 py-0.5 rounded-md text-[0.72rem] border border-[#ffaa00]/25 bg-[#ffaa00]/8 text-[#ffaa00]">Có</span>
                                            ) : (
                                                <span className="text-[#8899aa]" style={{ fontSize: "0.8rem" }}>—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => toggleEnabled(cmd)}
                                                className={`w-11 h-6 rounded-full border transition-all relative flex-shrink-0 ${cmd.active ? "bg-[#00ffaa]/15 border-[#00ffaa]/40" : "bg-[#0d2040] border-[#8899aa]/25"}`}>
                                                <span className={`absolute top-1 w-4 h-4 rounded-full transition-all ${cmd.active ? "left-6 bg-[#00ffaa]" : "left-1 bg-[#8899aa]"}`} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { setSelectedCmd(cmd); setModal("edit"); }}
                                                    className="p-1.5 rounded-lg border border-[#4488ff]/20 text-[#4488ff]/70 hover:bg-[#4488ff]/10 hover:text-[#4488ff] transition-all">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => deleteCmd(cmd.id)}
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
                        <div className="text-center py-10 text-[#8899aa]" style={{ fontSize: "0.875rem" }}>Không tìm thấy lệnh nào</div>
                    )}
                </div>
                <div className="px-4 py-3 border-t border-[#00ffaa]/8 text-[#8899aa]" style={{ fontSize: "0.72rem" }}>
                    Hiển thị {filtered.length}/{commands.length} lệnh
                </div>
            </div>

            <AnimatePresence>
                {modal === "add" && <CommandModal mode="add" onSave={handleAdd} onClose={() => setModal(null)} />}
                {modal === "edit" && selectedCmd && <CommandModal mode="edit" cmd={selectedCmd} onSave={handleEdit} onClose={() => { setModal(null); setSelectedCmd(null); }} />}
            </AnimatePresence>
        </div>
    );
}
