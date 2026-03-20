@api @smoke
Feature: Users API
  As an API consumer
  I want to manage users via the REST API
  So that I can create, read, update and delete user records

  Background:
    Given I have a valid API client
    And I authenticate with bearer token "valid-test-token"

  @smoke
  Scenario: Get all users returns a list
    When I send a GET request to "/api/users"
    Then the response status code should be 200
    And the response body should be an array
    And the response array should have at least 1 items
    And the response time should be less than 3000 milliseconds

  @smoke @regression
  Scenario: Get single user by ID
    When I send a GET request to "/api/users/1"
    Then the response status code should be 200
    And the response body should contain "id"
    And the response body should contain "email"
    And the response should match the user schema

  @regression
  Scenario: Create a new user
    When I send a POST request to "/api/users" with body:
      """
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "user"
      }
      """
    Then the response status code should be 201
    And the response body should contain "id"
    And the response body field "email" should equal "john.doe@example.com"
    And I store the response field "id" as "newUserId"

  @regression
  Scenario: Update an existing user
    When I send a PUT request to "/api/users/1" with body:
      """
      {
        "firstName": "Updated",
        "lastName": "Name"
      }
      """
    Then the response status code should be 200
    And the response body field "firstName" should equal "Updated"

  @regression
  Scenario: Delete a user
    When I send a DELETE request to "/api/users/1"
    Then the response status code should be 204

  @regression
  Scenario: Get non-existent user returns 404
    When I send a GET request to "/api/users/999999"
    Then the response status code should be 404

  @regression
  Scenario: Create user with missing required fields returns 400
    When I send a POST request to "/api/users" with body:
      """
      {
        "firstName": "NoEmail"
      }
      """
    Then the response status code should be 400

  @regression
  Scenario: Get users with query parameters
    When I send a GET request to "/api/users" with query params:
      | page     | 1    |
      | pageSize | 10   |
      | role     | user |
    Then the response status code should be 200
    And the response body should be an array

  @regression
  Scenario: Unauthorized request returns 401
    Given I have a valid API client
    When I send a GET request to "/api/users"
    Then the response status code should be 401
