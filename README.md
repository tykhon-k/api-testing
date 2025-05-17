# API Testing

This project demonstrates my ability to design and implement a fully structured API test automation framework from scratch by using **JavaScript**, **Jest**, and **Axios**.

Focused on clarity, best practices, and maintainability, it reflects how I approach backend testing in collaborative, production-ready environments.

## ✨ Features

- **Jest:** A delightful JavaScript Testing Framework with a focus on simplicity. Used for structuring and running tests.
- **Axios:** Promise-based HTTP client for Node.js, used for making API requests.
- **JavaScript (ES6+):** Modern JavaScript for writing test logic.
- **Structured Tests:** Test suites are organized by API resource and HTTP method (e.g., `booking.get.test.js`, `booking.post.test.js`) in the `tests/` directory.
- **Comprehensive API Coverage:**
  - Authentication (`/auth`)
  - GET `/booking` (all and by ID)
  - POST `/booking`
  - PUT `/booking/{id}`
  - DELETE `/booking/{id}`
- **Detailed Validations:**
  - Response status codes
  - Response body content (existence of fields, specific values)
  - Error handling for invalid inputs and unauthorized operations
- **Dynamic Test Data Generation:** Uses `@faker-js/faker` via `utils/testData.js` to produce realistic and varied data for each test run.
- **Reusable API Client:** A centralized Axios instance (`utils/apiClient.js`) pre-configured with the base URL, default headers, and an authentication helper function.
- **Configuration Management:** API base URL is managed in `config/apiConfig.js` for easy updates.
- **GitHub Actions CI:** Manually triggered workflow to run tests via the GitHub Actions interface.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (version 18.x or 20.x recommended)
- [npm](https://www.npmjs.com/get-npm)

### Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/tykhon-k/api-testing.git
    cd api-testing
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running Tests

```bash
npm test
```

This command will execute all `*.test.js` files within the `tests/` directory using Jest.

## 📂 Project Structure

```
api-testing/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI configuration
├── config/
│   └── apiConfig.js               # API base URL configuration
├── tests/
│   ├── auth.test.js               # Authentication tests
│   ├── booking.delete.test.js     # DELETE /booking/:id tests
│   ├── booking.get.test.js        # GET /booking and /booking/:id tests
│   ├── booking.post.test.js       # POST /booking tests
│   └── booking.put.test.js        # PUT /booking/:id tests
└── utils/
    ├── apiClient.js               # Axios HTTP client setup and auth helper
    └── testData.js                # Test data generation (using Faker.js)
```

## 🧪 Key Components Explained

### `utils/apiClient.js`

This file sets up and exports a pre-configured Axios instance (`apiClient`) for making HTTP requests.

- **Base URL:** Automatically prepends the API base URL (from `config/apiConfig.js`) to all requests.
- **Default Headers:** Sets `Content-Type: application/json` and `Accept: application/json` for all requests.
- **`authenticate(username, password)` function:** A helper function to make a POST request to the `/auth` endpoint, retrieve an authentication token, and handle potential "Bad credentials" responses from the API. The token is expected to be used in subsequent requests that require authentication (e.g., PUT, DELETE).

### `utils/testData.js`

Responsible for generating dynamic and realistic test data.

- **`DEFAULT_USERNAME`, `DEFAULT_PASSWORD`:** Constants for the default credentials used for authentication during tests.
- **`generateBookingData(overrides = {})` function:** Uses `@faker-js/faker` to create plausible booking payloads (firstname, lastname, totalprice, depositpaid, bookingdates, additionalneeds). It allows for overriding specific fields if needed for particular test scenarios. Ensures generated dates for checkin/checkout are in the future and correctly formatted.

### `config/apiConfig.js`

A simple module that exports the `API_BASE_URL` for the Restful-booker API. Centralizing this makes it easy to switch to a different API environment if needed.

### `tests/` Directory

Contains all Jest test suites.

- **File per Resource/Endpoint Group:** Tests are generally grouped by the API resource they target (e.g., `booking`) and further refined by operations (e.g., `booking.get.test.js`, `booking.post.test.js`).
- **`describe`, `it`, `expect`:** Standard Jest syntax is used to define test suites, individual test cases, and assertions.
- **Setup/Teardown:** `beforeAll` is used for one-time setup like authentication. `beforeEach` and `afterEach` are used to create and (attempt to) clean up specific test data for individual PUT/DELETE tests, ensuring test independence where possible.

### GitHub Actions CI

The CI workflow is configured for manual triggering via the GitHub Actions UI.
