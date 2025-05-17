const { apiClient } = require("../utils/apiClient");
const { generateBookingData } = require("../utils/testData");

describe("GET /booking endpoint tests", () => {
  let createdBookingIdForGetTest;

  beforeAll(async () => {
    const bookingData = generateBookingData();
    try {
      const response = await apiClient.post("/booking", bookingData);
      if (response && response.data && response.data.bookingid) {
        createdBookingIdForGetTest = response.data.bookingid;
      }
    } catch (error) {
      console.error(
        "Failed to create prerequisite booking for GET tests:",
        error.message
      );
    }
  });

  it("should retrieve a list of all booking IDs", async () => {
    const response = await apiClient.get("/booking");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    if (response.data.length > 0) {
      response.data.forEach((booking) => {
        expect(booking).toHaveProperty("bookingid");
        expect(typeof booking.bookingid).toBe("number");
      });
    }
  });

  it("should retrieve details for a specific, existing booking ID", async () => {
    let bookingIdToFetch;
    if (createdBookingIdForGetTest) {
      bookingIdToFetch = createdBookingIdForGetTest;
    } else {
      const bookingsResponse = await apiClient.get("/booking");
      expect(bookingsResponse.status).toBe(200);
      if (bookingsResponse.data.length === 0) {
        console.warn(
          "Skipping specific booking GET test: No bookings found to fetch."
        );
        return;
      }
      bookingIdToFetch = bookingsResponse.data[0].bookingid;
    }

    if (!bookingIdToFetch) {
      throw new Error(
        "No booking ID available to fetch for the specific GET test."
      );
    }

    const response = await apiClient.get(`/booking/${bookingIdToFetch}`);
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Object);
    expect(response.data.firstname).toBeDefined();
    expect(response.data.lastname).toBeDefined();
    expect(response.data.totalprice).toBeDefined();
    expect(response.data.depositpaid).toBeDefined();
    expect(response.data.bookingdates).toBeDefined();
    expect(response.data.bookingdates.checkin).toBeDefined();
    expect(response.data.bookingdates.checkout).toBeDefined();
  });

  it("should return 404 for a non-existent booking ID", async () => {
    const nonExistentBookingId = 999999999;
    try {
      await apiClient.get(`/booking/${nonExistentBookingId}`);
      throw new Error(
        "API returned success for a non-existent booking ID, expected 404."
      );
    } catch (error) {
      if (error.message.startsWith("API returned success")) throw error;
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(404);
    }
  });
});
