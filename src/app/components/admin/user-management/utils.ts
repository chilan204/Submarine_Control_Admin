export function initials(name: string) {
  if (!name) return "U";
  return name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
}
