export function resolveUser(pendingUser, socialMeta) {
  if (pendingUser?.email)
    return { name: pendingUser.name, email: pendingUser.email };
  if (socialMeta?.social)
    return { name: "Gast", guest: true, social: socialMeta.social };
  return { name: "Gast", guest: true };
}
