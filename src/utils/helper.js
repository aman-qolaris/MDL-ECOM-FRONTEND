// Helper to generate a cryptographically secure random float between 0 (inclusive) and 1 (exclusive)
const getSecureRandom = () => {
  const array = new Uint32Array(1);
  globalThis.crypto.getRandomValues(array);
  return array / (0xffffffff + 1);
};

// Generates a random 10-character password meeting standard complexity rules
export const generateTempPassword = () => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";

  // Ensure at least one of each required type to pass backend validation
  let password =
    upper[Math.floor(getSecureRandom() * upper.length)] +
    lower[Math.floor(getSecureRandom() * lower.length)] +
    numbers[Math.floor(getSecureRandom() * numbers.length)] +
    special[Math.floor(getSecureRandom() * special.length)];

  const allChars = upper + lower + numbers + special;

  // Fill the rest randomly
  for (let i = 0; i < 6; i++) {
    password += allChars[Math.floor(getSecureRandom() * allChars.length)];
  }

  // Shuffle the string so the pattern isn't always Upper-Lower-Number-Special...
  return password
    .split("")
    .sort(() => 0.5 - getSecureRandom())
    .join("");
};
