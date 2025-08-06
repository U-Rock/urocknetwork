// File: packages/auth-jwt/auth-guard.js

function checkAccess(user, requiredRole) {
  if (!user) throw new Error('Not logged in');
  if (user.role !== requiredRole) throw new Error('Unauthorized');
  return true;
}

module.exports = { checkAccess };
