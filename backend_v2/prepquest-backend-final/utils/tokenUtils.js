const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const jwtConfig = require('../config/jwt');
const prisma = require('../config/db');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn,
  });
};

const generateRefreshToken = async (userId) => {
  const token = jwt.sign({ userId }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, jwtConfig.accessSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtConfig.refreshSecret);
};

const generateVerificationToken = () => uuidv4();

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateVerificationToken,
};
