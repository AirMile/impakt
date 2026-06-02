export function validateLogin({ email, pw }) {
  const errs = {};
  if (!email) errs.email = "Vul je e-mail in";
  else if (!email.includes("@")) errs.email = "Dit is geen geldig e-mailadres";
  if (!pw) errs.pw = "Vul je wachtwoord in";
  return errs;
}

export function validateRegister({ name, email, pw, pw2, accept }) {
  const errs = {};
  if (!name) errs.name = "Hoe mogen we je noemen?";
  if (!email) errs.email = "Vul je e-mail in";
  else if (!email.includes("@")) errs.email = "Dit is geen geldig e-mailadres";
  if (!pw) errs.pw = "Verzin een wachtwoord";
  else if (pw.length < 6) errs.pw = "Min 6 tekens";
  if (pw && pw2 !== pw) errs.pw2 = "Komt niet overeen";
  if (!accept) errs.accept = "Accepteer eerst de voorwaarden";
  return errs;
}
