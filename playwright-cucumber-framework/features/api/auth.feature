@api @smoke
Feature: Authentication API
  As an API consumer
  I want to authenticate via the REST API
  So that I can obtain tokens and access protected resources

  Background:
    Given I have a valid API client

  @smoke
  Scenario: Login with valid credentials returns token
    When I send a POST request to "/api/auth/login" with body:
      """
      {
        "email":    "testuser@example.com",
        "password": "Test@1234"
      }
      """
    Then the response status code should be 200
    And the response body should contain "token"
    And I store the response field "token" as "authToken"

  @regression
  Scenario: Login with wrong password returns 401
    When I send a POST request to "/api/auth/login" with body:
      """
      {
        "email":    "testuser@example.com",
        "password": "WrongPassword!"
      }
      """
    Then the response status code should be 401

  @regression
  Scenario: Login with non-existent user returns 401
    When I send a POST request to "/api/auth/login" with body:
      """
      {
        "email":    "nobody@nowhere.com",
        "password": "SomePass@123"
      }
      """
    Then the response status code should be 401

  @regression
  Scenario: Refresh token endpoint works
    Given I authenticate with bearer token "valid-test-token"
    When I send a POST request to "/api/auth/refresh" with body:
      """
      { "refreshToken": "valid-refresh-token" }
      """
    Then the response status code should be 200
    And the response body should contain "token"

  @regression
  Scenario: Logout invalidates token
    Given I authenticate with bearer token "valid-test-token"
    When I send a POST request to "/api/auth/logout" with body:
      """
      {}
      """
    Then the response status code should be 200

  @regression
  Scenario: Accessing protected endpoint without token returns 401
    When I send a GET request to "/api/me"
    Then the response status code should be 401

  @regression
  Scenario: Forgot password endpoint accepts valid email
    When I send a POST request to "/api/auth/forgot-password" with body:
      """
      { "email": "testuser@example.com" }
      """
    Then the response status code should be 200

  @regression
  Scenario: Rate limiting is enforced on login
    When I send a POST request to "/api/auth/login" with body:
      """
      { "email": "brute@force.com", "password": "wrong1" }
      """
    And I send a POST request to "/api/auth/login" with body:
      """
      { "email": "brute@force.com", "password": "wrong2" }
      """
    Then the response time should be less than 5000 milliseconds
