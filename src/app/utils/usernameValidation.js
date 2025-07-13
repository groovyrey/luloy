// src/app/utils/usernameValidation.js

const USERNAME_MAX_LENGTH = 15;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/; // Alphanumeric and underscore only

export const validateUsername = (username) => {
  if (typeof username !== 'string') {
    return { isValid: false, message: 'Username must be a string.' };
  }

  if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters long.`,
    };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      isValid: false,
      message: 'Username can only contain letters, numbers, and underscores.',
    };
  }

  return { isValid: true, message: 'Username is valid.' };
};
