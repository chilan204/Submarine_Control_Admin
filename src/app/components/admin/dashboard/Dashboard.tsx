import { useEffect, useState } from "react";
import { Users, Mic, Terminal, History, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { DashboardData } from "./types";
import { timeAgo, getInitials, mapStatus } from "./utils";
import { CHART_TOOLTIP_STYLE, statusCfg, roleBadge, DAYS_OF_WEEK } from "./constants";
import { Card } from "./components/Card";

export function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    usersCount: 0,
    voiceSamplesCount: 0,
    commandsToday: 0,
    activeUsersToday: 0,
    dailyData: [],
    statusData: [],
    recentActivity: [],
    topUsers: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}` };

        const [usersRes, voicesRes, sessionsRes] = await Promise.all([
          fetch("http://localhost:8080/api/user", { headers }),
          fetch("http://localhost:8080/api/voice-samples", { headers }),
          fetch("http://localhost:8080/api/user-session", { headers })
        ]);

        const usersData = await usersRes.json();
        const voicesData = await voicesRes.json();
        const sessionsData = await sessionsRes.json();

        const usersCount = usersData.data?.length || 0;
        const voiceSamplesCount = voicesData.data?.length || 0;
        const sessions = sessionsData.data || [];

        // Sort sessions by date desc
        sessions.sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

        // Commands today
        const todayStr = new Date().toISOString().split("T")[0];
        const sessionsToday = sessions.filter((s: any) => s.createdDate.startsWith(todayStr));
        const commandsToday = sessionsToday.length;

        // Active users today
        const activeUsersSet = new Set(sessionsToday.map((s: any) => s.user?.id));
        const activeUsersToday = activeUsersSet.size;

        // Daily Data (last 7 days)
        const dailyMap = new Map();
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayName = DAYS_OF_WEEK[d.getDay()];
          const key = d.toISOString().split("T")[0];
          dailyMap.set(key, { day: dayName, total: 0, success: 0, failed: 0 });
        }

        let successCount = 0;
        let errorCount = 0;

        const userCmdCounts = new Map();

        sessions.forEach((s: any) => {
          // Status breakdown
          const st = mapStatus(s.commandStatus);
          if (st === "success") successCount++;
          else errorCount++;

          // Daily stats
          const dateKey = s.createdDate.split("T")[0];
          if (dailyMap.has(dateKey)) {
            const stat = dailyMap.get(dateKey);
            stat.total++;
            if (st === "success") stat.success++;
            else stat.failed++;
          }

          // Top users
          const uid = s.user?.id;
          if (uid) {
            if (!userCmdCounts.has(uid)) {
              userCmdCounts.set(uid, {
                id: uid,
                name: s.user.name,
                role: s.role || "UNKNOWN",
                count: 0
              });
            }
            userCmdCounts.get(uid).count++;
          }
        });

        const statusData = [
          { name: "Thành công", value: successCount, color: "#00ffaa" },
          { name: "Lỗi", value: errorCount, color: "#ff4444" },
        ];

        const topUsersArray = Array.from(userCmdCounts.values())
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 4)
          .map(u => ({
            ...u,
            initials: getInitials(u.name)
          }));

        const maxCmds = topUsersArray.length > 0 ? topUsersArray[0].count : 1;
        const topUsers = topUsersArray.map(u => ({ ...u, maxRatio: (u.count / maxCmds) * 100 }));

        const recentActivity = sessions.slice(0, 5).map((s: any) => ({
          user: s.user?.name || "Unknown",
          cmd: s.transcript || `${s.action} ${s.direction || ''} ${s.value || ''}`,
          status: mapStatus(s.commandStatus),
          time: timeAgo(s.createdDate),
          source: "voice" // Assuming all from API are voice for now, or check if transcript exists
        }));

        setData({
          usersCount,
          voiceSamplesCount,
          commandsToday,
          activeUsersToday,
          dailyData: Array.from(dailyMap.values()),
          statusData,
          recentActivity,
          topUsers
        });

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const STATS = [
    { label: "Tổng số người dùng", value: data.usersCount, sub: "Đã đăng ký", icon: <Users className="w-5 h-5" />, color: "#4488ff", bg: "rgba(68,136,255,0.08)", border: "rgba(68,136,255,0.2)" },
    { label: "Người dùng hôm nay", value: data.activeUsersToday, sub: "Có tương tác lệnh", icon: <TrendingUp className="w-5 h-5" />, color: "#00ffaa", bg: "rgba(0,255,170,0.08)", border: "rgba(0,255,170,0.2)" },
    { label: "Lệnh hôm nay", value: data.commandsToday, sub: "Lệnh đã xử lý", icon: <Terminal className="w-5 h-5" />, color: "#ffaa00", bg: "rgba(255,170,0,0.08)", border: "rgba(255,170,0,0.2)" },
    { label: "Mẫu giọng nói", value: data.voiceSamplesCount, sub: "Đã thu thập", icon: <Mic className="w-5 h-5" />, color: "#ff66aa", bg: "rgba(255,102,170,0.08)", border: "rgba(255,102,170,0.2)" },
  ];

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ffaa] animate-pulse mt-1" />
            </div>
            <div className="text-white mb-0.5" style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "monospace" }}>
              {s.value}
            </div>
            <div className="text-white" style={{ fontSize: "0.8rem" }}>{s.label}</div>
            <div className="text-[#8899aa]" style={{ fontSize: "0.7rem" }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart — takes 2/3 */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Hoạt động lệnh (7 ngày)</h3>
              <p className="text-[#8899aa]" style={{ fontSize: "0.72rem" }}>Tổng số lệnh được thực thi mỗi ngày</p>
            </div>
            <div className="flex items-center gap-3" style={{ fontSize: "0.7rem" }}>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00ffaa] inline-block" />Thành công</span>
              <span className="flex items-center gap-1.5 text-[#8899aa]"><span className="w-2.5 h-2.5 rounded-full bg-[#ff4444] inline-block" />Thất bại</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ffaa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ffaa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ff4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,170,0.06)" />
              <XAxis dataKey="day" tick={{ fill: "#8899aa", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8899aa", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Area type="monotone" name="Thành công" dataKey="success" stroke="#00ffaa" strokeWidth={2} fill="url(#successGrad)" />
              <Area type="monotone" name="Thất bại" dataKey="failed" stroke="#ff4444" strokeWidth={2} fill="url(#failedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie chart */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Phân bố trạng thái</h3>
            <p className="text-[#8899aa]" style={{ fontSize: "0.72rem" }}>Kết quả lệnh toàn thời gian</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={data.statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {data.statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {data.statusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[#8899aa]" style={{ fontSize: "0.75rem" }}>{d.name}</span>
                </div>
                <span className="text-white" style={{ fontSize: "0.75rem", fontWeight: 600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent activity */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Hoạt động gần đây</h3>
            <History className="w-4 h-4 text-[#8899aa]" />
          </div>
          <div className="space-y-2">
            {data.recentActivity.map((a, i) => {
              const cfg = statusCfg[a.status as keyof typeof statusCfg] || statusCfg.success;
              return (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#050f1e]/60 border border-[#00ffaa]/5">
                  <span style={{ color: cfg.color }}>{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate" style={{ fontSize: "0.8rem", textTransform: "capitalize" }}>{a.cmd}</p>
                    <p className="text-[#8899aa]" style={{ fontSize: "0.68rem" }}>{a.user}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[0.6rem] border ${a.source === "voice" ? "border-[#00ffaa]/20 text-[#00ffaa]/70" : "border-[#4488ff]/20 text-[#4488ff]/70"}`}>
                      {a.source}
                    </span>
                    <p className="text-[#8899aa] mt-0.5" style={{ fontSize: "0.65rem" }}>{a.time}</p>
                  </div>
                </div>
              );
            })}
            {data.recentActivity.length === 0 && (
              <p className="text-[#8899aa] text-center" style={{ fontSize: "0.8rem" }}>Chưa có hoạt động nào</p>
            )}
          </div>
        </Card>

        {/* Top users */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Top người dùng</h3>
            <Users className="w-4 h-4 text-[#8899aa]" />
          </div>
          <div className="space-y-3">
            {data.topUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[#8899aa] w-5 text-center" style={{ fontSize: "0.75rem" }}>#{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-[#00ffaa]/10 border border-[#00ffaa]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00ffaa]" style={{ fontSize: "0.65rem", fontWeight: 700 }}>{u.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate" style={{ fontSize: "0.82rem" }}>{u.name}</p>
                  <span className={`inline-block px-1.5 py-0 rounded text-[0.6rem] border ${roleBadge[u.role] || roleBadge.OFFICER_1}`}>{u.role}</span>
                </div>
                <div className="text-right">
                  <p className="text-[#00ffaa]" style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "monospace" }}>{u.count}</p>
                  <p className="text-[#8899aa]" style={{ fontSize: "0.62rem" }}>lệnh</p>
                </div>
                <div className="w-16 h-1.5 bg-[#0d2040] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00ffaa] rounded-full transition-all duration-1000"
                    style={{ width: `${u.maxRatio}%` }}
                  />
                </div>
              </div>
            ))}
            {data.topUsers.length === 0 && (
              <p className="text-[#8899aa] text-center" style={{ fontSize: "0.8rem" }}>Chưa có dữ liệu</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
