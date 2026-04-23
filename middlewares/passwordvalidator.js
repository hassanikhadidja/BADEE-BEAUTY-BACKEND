/** True if password is at least 6 characters (any mix of letters, digits, symbols). */
function passwordvalidator(ch) {
  const s = ch == null ? "" : String(ch);
  return s.length >= 6;
}

module.exports = passwordvalidator;
