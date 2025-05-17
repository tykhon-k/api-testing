const { authenticate } = require("../utils/apiClient");
const { DEFAULT_USERNAME, DEFAULT_PASSWORD } = require("../utils/testData");

describe("Authentication tests", () => {
  it("should successfully authenticate and receive a token", async () => {
    try {
      const token = await authenticate(DEFAULT_USERNAME, DEFAULT_PASSWORD);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(10);
    } catch (error) {
      console.error("Authentication test failed unexpectedly:", error);
      throw error;
    }
  });

  it("should fail authentication with invalid credentials", async () => {
    try {
      await authenticate("invaliduser", "invalidpassword");
      throw new Error(
        "Authentication succeeded unexpectedly with invalid credentials"
      );
    } catch (error) {
      if (error.message.startsWith("Authentication succeeded unexpectedly")) {
        throw error;
      }
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(200);
      expect(error.response.data).toBeDefined();
      expect(error.response.data.reason).toBe("Bad credentials");
    }
  });
});
