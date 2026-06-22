import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Eye, EyeOff, User, Lock } from "lucide-react";

interface AdminLoginProps {
    onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!username.trim() || !password) {
            setError("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/password-login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username.trim(),
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok && data.data?.token) {
                if (data.data.roleCode === "ADMIN") {
                    sessionStorage.setItem(
                        "token",
                        data.data.token
                    );

                    sessionStorage.setItem(
                        "user",
                        JSON.stringify(data.data)
                    );

                    setError("");
                    onLogin();
                    return;
                }

                setError(
                    "Bạn không có quyền truy cập hệ thống quản trị"
                );
                return;
            }

            const msg = data.message || "";
            if (
                msg.toLowerCase().includes("not found") ||
                msg.toLowerCase().includes("invalid") ||
                msg.toLowerCase().includes("bad credential") ||
                msg.toLowerCase().includes("wrong")
            ) {
                setError("Tên đăng nhập hoặc mật khẩu không đúng.");
            } else {
                setError(msg || "Tên đăng nhập hoặc mật khẩu không đúng.");
            }
        } catch {
            setError(
                "Lỗi kết nối mạng. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative">
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(0,255,170,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,0.5) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm mx-4 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-3">
                        <div className="w-16 h-16 rounded-2xl bg-[#00ffaa]/10 border-2 border-[#00ffaa]/40 flex items-center justify-center">
                            <Shield className="w-8 h-8 text-[#00ffaa]" />
                        </div>
                    </div>

                    <h1
                        className="text-white"
                        style={{
                            fontSize: "1.4rem",
                            fontWeight: 700,
                            letterSpacing: "0.25em",
                            fontFamily: "monospace",
                        }}
                    >
                        HỆ THỐNG ĐIỀU KHIỂN AUV
                    </h1>

                    <p
                        className="text-[#00ffaa]/50"
                        style={{
                            fontSize: "0.7rem",
                            letterSpacing: "0.3em",
                            fontFamily: "monospace",
                        }}
                    >
                        CỔNG THÔNG TIN QUẢN TRỊ VIÊN
                    </p>
                </div>

                <div className="bg-[#0a1628]/90 border border-[#00ffaa]/15 rounded-2xl p-6 shadow-2xl shadow-black/60 backdrop-blur-md">
                    <h2
                        className="text-white text-center mb-5"
                        style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                        }}
                    >
                        ĐĂNG NHẬP QUẢN TRỊ VIÊN
                    </h2>

                    <label
                        className="block text-[#8899aa] mb-1.5"
                        style={{
                            fontSize: "0.72rem",
                            letterSpacing: "0.12em",
                        }}
                    >
                        TÊN ĐĂNG NHẬP
                    </label>

                    <div className="relative mb-4">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4488ff]/50" />

                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError("");
                            }}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleSubmit()
                            }
                            placeholder="Nhập tên đăng nhập"
                            className="w-full bg-[#0d2040] border border-[#4488ff]/25 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-[#4466aa]/40 focus:outline-none focus:border-[#4488ff]/60 transition-colors"
                        />
                    </div>

                    <label
                        className="block text-[#8899aa] mb-1.5"
                        style={{
                            fontSize: "0.72rem",
                            letterSpacing: "0.12em",
                        }}
                    >
                        MẬT KHẨU
                    </label>

                    <div className="relative mb-5">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4488ff]/50" />

                        <input
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleSubmit()
                            }
                            placeholder="Nhập mật khẩu"
                            className="w-full bg-[#0d2040] border border-[#4488ff]/25 rounded-lg pl-10 pr-11 py-2.5 text-white placeholder-[#4466aa]/40 focus:outline-none focus:border-[#4488ff]/60 transition-colors"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4488ff]/40 hover:text-[#4488ff] transition-colors"
                        >
                            {showPw ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{
                                    opacity: 1,
                                    height: "auto",
                                }}
                                exit={{
                                    opacity: 0,
                                    height: 0,
                                }}
                                className="text-red-400 mb-3 overflow-hidden"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg bg-[#00ffaa] hover:bg-[#00dd99] disabled:opacity-60 text-[#030d1a] transition-all"
                        style={{
                            fontWeight: 700,
                            letterSpacing: "0.2em",
                            fontFamily: "monospace",
                        }}
                    >
                        {loading
                            ? "ĐANG XÁC THỰC..."
                            : "ĐĂNG NHẬP"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}