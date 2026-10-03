import type { Role } from "./types";

export function countHighestPriorityRoles(roles: readonly Role[]): number {
  if (roles.length === 0) return 0;
  const highestPriority = roles.reduce((highest, role) => Math.max(highest, role.priority), -Infinity);
  return roles.filter(role => role.priority === highestPriority).length;
}
