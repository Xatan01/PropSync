export type AuthRole = "agent" | "client";

const ACTIVE_ROLE_KEY = "active_role";

export function getTokenKey(role: AuthRole, type: "access" | "refresh") {
  return `${role}_${type}_token`;
}

export function getUserKey(role: AuthRole) {
  return `${role}_user`;
}

export function getActiveRole(): AuthRole {
  const stored = localStorage.getItem(ACTIVE_ROLE_KEY);
  if (stored === "client") return "client";
  return "agent";
}

export function setActiveRole(role: AuthRole) {
  localStorage.setItem(ACTIVE_ROLE_KEY, role);
}

export function clearActiveRole() {
  localStorage.removeItem(ACTIVE_ROLE_KEY);
}

export function resolveActiveRole(): AuthRole {
  const stored = localStorage.getItem(ACTIVE_ROLE_KEY);
  if (stored === "agent" || stored === "client") return stored;
  if (localStorage.getItem(getTokenKey("agent", "access"))) return "agent";
  if (localStorage.getItem(getTokenKey("client", "access"))) return "client";
  return "agent";
}
