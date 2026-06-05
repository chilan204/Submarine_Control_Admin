export function timeAgo(date: Date) {
    const diff = Date.now() - date.getTime();

    const mins = Math.floor(diff / 60000);

    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins} phút trước`;

    const hrs = Math.floor(mins / 60);

    if (hrs < 24) return `${hrs} giờ trước`;

    return `${Math.floor(hrs / 24)} ngày trước`;
}

export function formatTime(date: Date) {
    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}