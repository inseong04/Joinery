export function getRandomSixDigitString(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
