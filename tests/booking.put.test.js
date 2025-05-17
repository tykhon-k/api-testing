const { apiClient, authenticate } = require("../utils/apiClient");
const {
  generateBookingData,
  DEFAULT_USERNAME,
  DEFAULT_PASSWORD,
} = require("../utils/testData");

describe("PUT /booking/{id} endpoint tests", () => {
  let authToken;
  let bookingIdToUpdate;

  beforeAll(async () => {
    try {
      authToken = await authenticate(DEFAULT_USERNAME, DEFAULT_PASSWORD);
      expect(authToken).toBeDefined();
    } catch (authError) {
      console.error(
        "Critical: Authentication failed in beforeAll for PUT tests.",
        authError
      );
      throw authError;
    }
  });

  beforeEach(async () => {
    if (!authToken) {
      throw new Error(
        "Auth token not available for creating booking in beforeEach for PUT test."
      );
    }
    const bookingData = generateBookingData({ firstname: "ToUpdate" });
    try {
      const response = await apiClient.post("/booking", bookingData);
      expect(response.data && response.data.bookingid).toBeDefined();
      bookingIdToUpdate = response.data.bookingid;
    } catch (createError) {
      console.error(
        "Critical: Failed to create booking in beforeEach for PUT tests.",
        createError.message
      );
      throw createError;
    }
  });

  afterEach(async () => {
    if (bookingIdToUpdate && authToken) {
      try {
        await apiClient.delete(`/booking/${bookingIdToUpdate}`, {
          headers: { Cookie: `token=${authToken}` },
        });
      } catch (deleteError) {
        console.warn(
          `Warning: Failed to cleanup booking ${bookingIdToUpdate} after PUT test:`,
          deleteError.message
        );
      }
      bookingIdToUpdate = null;
    }
  });

  it("should update an existing booking successfully", async () => {
    expect(bookingIdToUpdate).toBeDefined();
    expect(authToken).toBeDefined();

    const updateDetails = generateBookingData({
      firstname: "UserWasUpdated",
      lastname: "Successfully",
      totalprice: 1234,
      depositpaid: false,
      bookingdates: { checkin: "2028-01-01", checkout: "2028-01-05" },
      additionalneeds: "All needs met by update",
    });

    const response = await apiClient.put(
      `/booking/${bookingIdToUpdate}`,
      updateDetails,
      {
        headers: {
          Cookie: `token=${authToken}`,
          Accept: "application/json",
        },
      }
    );

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(updateDetails);

    const getResponse = await apiClient.get(`/booking/${bookingIdToUpdate}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.data).toMatchObject(updateDetails);
  });

  it("should return 403 when trying to update without a token", async () => {
    expect(bookingIdToUpdate).toBeDefined();
    const updateData = generateBookingData({
      firstname: "NoAuthUpdateAttempt",
    });
    try {
      await apiClient.put(`/booking/${bookingIdToUpdate}`, updateData, {
        headers: { Accept: "application/json" },
      });
      throw new Error(
        "API did not return 403 for unauthorized update, but succeeded."
      );
    } catch (error) {
      if (error.message.startsWith("API did not return 403")) throw error;
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(403);
      expect(error.response.data).toBe("Forbidden");
    }
  });

  it("should return 403 when trying to update with an invalid token", async () => {
    expect(bookingIdToUpdate).toBeDefined();
    const updateData = generateBookingData({
      firstname: "InvalidAuthUpdateAttempt",
    });
    try {
      await apiClient.put(`/booking/${bookingIdToUpdate}`, updateData, {
        headers: {
          Cookie: `token=thisIsAnInvalidToken123`,
          Accept: "application/json",
        },
      });
      throw new Error(
        "API did not return 403 for invalid token update, but succeeded."
      );
    } catch (error) {
      if (error.message.startsWith("API did not return 403")) throw error;
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(403);
      expect(error.response.data).toBe("Forbidden");
    }
  });
});
