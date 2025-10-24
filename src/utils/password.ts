// ✅ Password must include:
// - At least 1 lowercase
// - At least 1 uppercase
// - At least 1 digit
// - At least 1 special character
// - Minimum length of 8 characters
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
