const { expressjwt: jwt } = require('express-jwt');

authJwt = () => {
  const secret = process.env.JWT_SECRET;
  const api = process.env.API_URL;
  return jwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/api\/v1\/products(.*)/, method: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/categories(.*)/, method: ['GET', 'OPTIONS'] },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
};

// User & Admin: User Roles
async function isRevoked(req, token) {
  if (!token.payload.isAdmin) {
    return true;
  }
  return false;
}
module.exports = authJwt;
