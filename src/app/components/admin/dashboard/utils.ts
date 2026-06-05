export function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

export function getInitials(name: string) {
  if (!name) return "U";
  return name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
}

export function mapStatus(status: string) {
  if (status === "EXECUTED") return "success";
  if (status && (status.includes("REJECTED") || status.includes("DENIED") || status.includes("CONFLICT"))) return "warning";
  return "error";
}
