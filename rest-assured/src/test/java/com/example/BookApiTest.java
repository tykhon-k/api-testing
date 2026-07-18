package com.example;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** REST Assured contract tests for the Bookstore API. */
class BookApiTest {

  @BeforeAll
  static void setup() {
    String base = System.getenv().getOrDefault("API_BASE_URL", "http://localhost:3000");
    RestAssured.baseURI = base;
  }

  @BeforeEach
  void reset() {
    given().post("/reset").then().statusCode(200);
  }

  private String authToken() {
    return given()
        .contentType(ContentType.JSON)
        .body("{\"username\":\"admin\",\"password\":\"password123\"}")
        .when()
        .post("/auth")
        .then()
        .statusCode(200)
        .extract()
        .path("token");
  }

  @Test
  @DisplayName("auth returns a token for valid credentials")
  void authReturnsToken() {
    given()
        .contentType(ContentType.JSON)
        .body("{\"username\":\"admin\",\"password\":\"password123\"}")
        .when()
        .post("/auth")
        .then()
        .statusCode(200)
        .body("token", notNullValue());
  }

  @Test
  @DisplayName("GET /books returns the two seeded books")
  void listsSeededBooks() {
    given()
        .when()
        .get("/books")
        .then()
        .statusCode(200)
        .body("$", hasSize(2))
        .body("[0].title", equalTo("Clean Code"));
  }

  @Test
  @DisplayName("creating a book requires a valid token")
  void createRequiresToken() {
    String token = authToken();
    given()
        .header("Authorization", "Bearer " + token)
        .contentType(ContentType.JSON)
        .body("{\"title\":\"Refactoring\",\"author\":\"Martin Fowler\",\"price\":44.95}")
        .when()
        .post("/books")
        .then()
        .statusCode(201)
        .body("id", greaterThan(0))
        .body("title", equalTo("Refactoring"));
  }

  @Test
  @DisplayName("creating a book without a token is rejected with 401")
  void createWithoutTokenRejected() {
    given()
        .contentType(ContentType.JSON)
        .body("{\"title\":\"No Auth\",\"author\":\"Nobody\",\"price\":1}")
        .when()
        .post("/books")
        .then()
        .statusCode(401);
  }
}
