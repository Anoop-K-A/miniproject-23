const PRIMARY_ADMIN_EMAIL = "admin@collage.com";
const PRIMARY_ADMIN_USERNAME = "Admin";
const PRIMARY_ADMIN_PASSWORD = "Admin@123";
const PRIMARY_ADMIN_NAME = "Admin User";

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function normalizeUsername(username = "") {
  return String(username).trim().toLowerCase();
}

function isPrimaryAdminEmail(email = "") {
  return normalizeEmail(email) === PRIMARY_ADMIN_EMAIL;
}

function isPrimaryAdminUsername(username = "") {
  return (
    normalizeUsername(username) === normalizeUsername(PRIMARY_ADMIN_USERNAME)
  );
}

module.exports = {
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_USERNAME,
  PRIMARY_ADMIN_PASSWORD,
  PRIMARY_ADMIN_NAME,
  normalizeEmail,
  normalizeUsername,
  isPrimaryAdminEmail,
  isPrimaryAdminUsername,
};
