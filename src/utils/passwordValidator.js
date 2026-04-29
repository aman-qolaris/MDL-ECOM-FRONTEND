/**
 * Validates a password based on strict rules.
 * Requirements: 8-16 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.
 * Returns an error string if invalid, or null if valid.
 */
export const validatePassword = (password) => {
  if (!password) return "Password is required.";

  if (password.length < 8 || password.length > 16) {
    return "Password must be between 8 and 16 characters long.";
  }

  // Regex checks for at least 1 Lowercase, 1 Uppercase, 1 Number, 1 Special Char
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  if (!passwordRegex.test(password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g. @$!%*?&).";
  }

  return null; // null means validation passed perfectly!
};
