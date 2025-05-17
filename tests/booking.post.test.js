const { apiClient } = require("../utils/apiClient");
const { generateBookingData } = require("../utils/testData");

describe("POST /booking endpoint tests", () => {
  let createdBookingIdByPostTest;

  afterEach(async () => {
    // Attempt to clean up booking created by the POST test if an ID was captured.
    // A full system would have robust cleanup, possibly in global teardown or by specific cleanup jobs.
    // Since this API needs a token for DELETE, true cleanup here is skipped for focus.
    if (createdBookingIdByPostTest) {
      createdBookingIdByPostTest = null;
    }
  });

  it("should create a new booking successfully", async () => {
    const bookingData = generateBookingData();
    const response = await apiClient.post("/booking", bookingData);

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.bookingid).toBeDefined();
    expect(typeof response.data.bookingid).toBe("number");
    createdBookingIdByPostTest = response.data.bookingid;

    expect(response.data.booking).toMatchObject(bookingData);
  });

  it("should return an error for invalid booking data", async () => {
    const invalidApiPayload = {
      additionalneeds: "No key fields here, should cause API error",
    };

    try {
      await apiClient.post("/booking", invalidApiPayload);
      throw new Error(
        "API did not return an error for invalid booking data, but was expected to."
      );
    } catch (error) {
      if (error.message.startsWith("API did not return an error")) throw error;

      expect(error.response).toBeDefined();
      // The API returns 500 for various malformed inputs on POST
      // This is not ideal (400 would be more appropriate), but I test actual behavior.
      expect(error.response.status).toBe(500);
    }
  });
});
