const bcrypt = require('bcrypt');

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 8;
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const sanitizeUser = (user) => {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
};

const sanitizeUsers = (users) => {
    return users.map(user => sanitizeUser(user));
};

module.exports = {
    validateEmail,
    validatePassword,
    hashPassword,
    sanitizeUser,
    sanitizeUsers
};