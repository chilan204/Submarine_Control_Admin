export function isSystemRole(code: string): boolean {
  return code === "ADMIN" || /^OFFICER_[1-5]$/.test(code);
}
