const axios = require("axios");
const { API_BASE_URL } = require("../config/apiConfig");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>}
 * @throws {Error}
 */

const authenticate = async (username, password) => {
  try {
    const response = await apiClient.post("/auth", {
      username,
      password,
    });

    if (response.data && response.data.token) {
      return response.data.token;
    } else {
      const authError = new Error(
        `Authentication failed: ${
          response.data && response.data.reason
            ? response.data.reason
            : "No token received."
        }`
      );
      authError.response = response;
      throw authError;
    }
  } catch (error) {
    if (error.response) {
      console.error(
        "Authentication request failed with response:",
        error.response.status,
        error.response.data
      );
      throw error;
    }
    const wrappedError = new Error(
      `Authentication network or processing error: ${error.message}`
    );
    wrappedError.originalError = error;
    throw wrappedError;
  }
};

module.exports = {
  apiClient,
  authenticate,
};
