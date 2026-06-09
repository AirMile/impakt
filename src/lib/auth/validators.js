export function validateLogin({ email, pw }) {
  const errs = {};
  if (!email) errs.email = "Vul je e-mail in";
  else if (!email.includes("@")) errs.email = "Dit is geen geldig e-mailadres";
  if (!pw) errs.pw = "Vul je wachtwoord in";
  return errs;
}

export function validateRegister({ username, email, pw, pw2 }) {
  const errs = {};
  if (!username) errs.username = "Kies een gebruikersnaam";
  if (!email) errs.email = "Vul je e-mail in";
  else if (!email.includes("@")) errs.email = "Dit is geen geldig e-mailadres";
  if (!pw) errs.pw = "Verzin een wachtwoord";
  else if (pw.length < 6) errs.pw = "Min 6 tekens";
  if (pw && pw2 !== pw) errs.pw2 = "Komt niet overeen";
  return errs;
}
