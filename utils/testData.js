const { faker } = require("@faker-js/faker");

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "password123";

const generateBookingData = (overrides = {}) => {
  const checkInDate = faker.date.soon({ days: 1 });
  const checkOutDate = faker.date.soon({
    days: faker.number.int({ min: 2, max: 15 }),
    refDate: checkInDate,
  });

  const formatDate = (date) => date.toISOString().split("T")[0];

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 50, max: 2000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      checkin: formatDate(checkInDate),
      checkout: formatDate(checkOutDate),
    },
    additionalneeds: faker.lorem.sentence({ min: 3, max: 7 }),
    ...overrides,
  };
};

module.exports = {
  DEFAULT_USERNAME,
  DEFAULT_PASSWORD,
  generateBookingData,
};
