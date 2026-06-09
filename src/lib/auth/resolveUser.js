export function resolveUser(pendingUser, socialMeta) {
  if (pendingUser?.email) {
    const user = {
      name: pendingUser.name ?? pendingUser.username ?? "Gebruiker",
      email: pendingUser.email,
    };
    if (pendingUser.token) user.token = pendingUser.token;
    return user;
  }
  if (socialMeta?.social)
    return { name: "Gast", guest: true, social: socialMeta.social };
  return { name: "Gast", guest: true };
}
