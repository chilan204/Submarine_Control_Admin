import type { User, UserFormData } from "./types";

export function buildUserUpdate(user: User, form: UserFormData) {
  const { password, ...fields } = form;
  const payload = { ...fields, version: user.version };
  return password?.trim() ? { ...payload, password } : payload;
}
