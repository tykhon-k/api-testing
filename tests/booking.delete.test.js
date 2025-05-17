const { apiClient, authenticate } = require("../utils/apiClient");
const {
  generateBookingData,
  DEFAULT_USERNAME,
  DEFAULT_PASSWORD,
} = require("../utils/testData");

describe("DELETE /booking/{id} endpoint tests", () => {
  let authToken;
  let bookingIdForMainDeleteTest;

  beforeAll(async () => {
    try {
      authToken = await authenticate(DEFAULT_USERNAME, DEFAULT_PASSWORD);
      expect(authToken).toBeDefined();
    } catch (authError) {
      console.error(
        "Critical: Authentication failed in beforeAll for DELETE tests.",
        authError
      );
      throw authError;
    }
  });

  beforeEach(async () => {
    if (!authToken) {
      throw new Error(
        "Auth token not available for creating booking in beforeEach for DELETE test."
      );
    }
    const bookingData = generateBookingData({ firstname: "ToDeleteMain" });
    try {
      const response = await apiClient.post("/booking", bookingData);
      expect(response.data && response.data.bookingid).toBeDefined();
      bookingIdForMainDeleteTest = response.data.bookingid;
    } catch (createError) {
      console.error(
        "Critical: Failed to create booking in beforeEach for DELETE tests.",
        createError.message
      );
      throw createError;
    }
  });

  afterEach(async () => {
    if (bookingIdForMainDeleteTest && authToken) {
      try {
        await apiClient.delete(`/booking/${bookingIdForMainDeleteTest}`, {
          headers: { Cookie: `token=${authToken}` },
        });
      } catch (deleteError) {}
      bookingIdForMainDeleteTest = null;
    }
  });

  it("should delete an existing booking successfully", async () => {
    expect(bookingIdForMainDeleteTest).toBeDefined();
    expect(authToken).toBeDefined();

    const response = await apiClient.delete(
      `/booking/${bookingIdForMainDeleteTest}`,
      {
        headers: { Cookie: `token=${authToken}` },
      }
    );
    expect(response.status).toBe(201);
    expect(response.data).toBe("Created");
    try {
      await apiClient.get(`/booking/${bookingIdForMainDeleteTest}`);
      throw new Error(
        "Booking was not deleted, GET request succeeded unexpectedly."
      );
    } catch (error) {
      if (error.message.startsWith("Booking was not deleted")) throw error;
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(404);
    }
    bookingIdForMainDeleteTest = null;
  });

  it("should return 403 when trying to delete without a token", async () => {
    let tempBookingId;
    const bookingData = generateBookingData({ firstname: "ToDeleteNoAuth" });
    try {
      const createResponse = await apiClient.post("/booking", bookingData);
      tempBookingId = createResponse.data.bookingid;
      expect(tempBookingId).toBeDefined();
      await apiClient.delete(`/booking/${tempBookingId}`);
      throw new Error(
        `DELETE request for booking ${tempBookingId} without a token succeeded unexpectedly. Expected a 403 error.`
      );
    } catch (error) {
      if (error.message.includes("succeeded unexpectedly")) {
        console.error("Test Failure Details (DELETE no auth):", error.message);
        throw error;
      }
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(403);
      expect(error.response.data).toBe("Forbidden");
    } finally {
      if (tempBookingId && authToken) {
        try {
          await apiClient.delete(`/booking/${tempBookingId}`, {
            headers: { Cookie: `token=${authToken}` },
          });
        } catch (cleanupError) {}
      }
    }
  });

  it("should return 405 when trying to delete a non-existent booking with auth", async () => {
    expect(authToken).toBeDefined();
    const nonExistentBookingId = 999999999;
    try {
      await apiClient.delete(`/booking/${nonExistentBookingId}`, {
        headers: { Cookie: `token=${authToken}` },
      });
      throw new Error(
        "API did not return an error for deleting non-existent booking with auth, but succeeded."
      );
    } catch (error) {
      if (error.message.startsWith("API did not return an error")) throw error;
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(405);
      expect(error.response.data).toBe("Method Not Allowed");
    }
  });
});
