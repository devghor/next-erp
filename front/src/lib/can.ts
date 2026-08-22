export function can(permissions: string[] | undefined, permission: string | string[]): boolean {
  const keys = Array.isArray(permission) ? permission : [permission];
  return keys.some((key) => (permissions ?? []).includes(key));
}
