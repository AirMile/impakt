import { resolveUser } from "./resolveUser";

test("email-gebruiker retourneert name + email", () => {
  const result = resolveUser({ name: "Miles", email: "miles@test.nl" }, null);
  expect(result).toEqual({ name: "Miles", email: "miles@test.nl" });
});

test("social-gast retourneert guest:true + social provider", () => {
  const result = resolveUser(
    { name: "Gast", email: "" },
    { guest: true, social: "google" }
  );
  expect(result).toEqual({ name: "Gast", guest: true, social: "google" });
});

test("anonieme gast (skip) retourneert alleen guest:true", () => {
  const result = resolveUser(null, { guest: true });
  expect(result).toEqual({ name: "Gast", guest: true });
});

test("pendingUser zonder email valt terug op social-check", () => {
  const result = resolveUser(
    { name: "Gast", email: "" },
    { guest: true, social: "apple" }
  );
  expect(result.social).toBe("apple");
});
