import { validateLogin, validateRegister } from "./validators";

describe("validateLogin", () => {
  test("leeg email → fout", () => {
    expect(validateLogin({ email: "", pw: "wachtwoord" }).email).toBeTruthy();
  });

  test("email zonder @ → fout", () => {
    expect(
      validateLogin({ email: "geen-at", pw: "wachtwoord" }).email
    ).toBeTruthy();
  });

  test("leeg wachtwoord → fout", () => {
    expect(validateLogin({ email: "x@y.nl", pw: "" }).pw).toBeTruthy();
  });

  test("geldig → geen fouten", () => {
    expect(validateLogin({ email: "a@b.nl", pw: "123456" })).toEqual({});
  });
});

describe("validateRegister", () => {
  const valid = {
    name: "Alice",
    email: "a@b.nl",
    pw: "Secure1!",
    pw2: "Secure1!",
    accept: true,
  };

  test("alle velden geldig → geen fouten", () => {
    expect(validateRegister(valid)).toEqual({});
  });

  test("naam leeg → fout", () => {
    expect(validateRegister({ ...valid, name: "" }).name).toBeTruthy();
  });

  test("email leeg → fout", () => {
    expect(validateRegister({ ...valid, email: "" }).email).toBeTruthy();
  });

  test("email zonder @ → fout", () => {
    expect(validateRegister({ ...valid, email: "geen-at" }).email).toBeTruthy();
  });

  test("wachtwoord leeg → fout", () => {
    expect(validateRegister({ ...valid, pw: "", pw2: "" }).pw).toBeTruthy();
  });

  test("wachtwoord te kort (< 6) → fout", () => {
    expect(
      validateRegister({ ...valid, pw: "abc", pw2: "abc" }).pw
    ).toBeTruthy();
  });

  test("wachtwoorden komen niet overeen → fout", () => {
    expect(validateRegister({ ...valid, pw2: "anders" }).pw2).toBeTruthy();
  });

  test("voorwaarden niet geaccepteerd → fout", () => {
    expect(validateRegister({ ...valid, accept: false }).accept).toBeTruthy();
  });
});
