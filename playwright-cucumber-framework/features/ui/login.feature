@ui @smoke
Feature: User Authentication - Login
  As a registered user
  I want to be able to log into the application
  So that I can access my account and features

  Background:
    Given I am on the login page

  @smoke @regression
  Scenario: Successful login with valid credentials
    When I enter username "testuser@example.com"
    And I enter password "Test@1234"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see "Welcome"

  @regression
  Scenario: Login fails with invalid password
    When I enter username "testuser@example.com"
    And I enter password "WrongPassword123"
    And I click the login button
    Then I should see an error message "invalid credentials"
    And I should remain on the login page

  @regression
  Scenario: Login fails with empty credentials
    When I click the login button
    Then the element "[data-testid='username-input'], input[type='email']" should be visible
    And I should remain on the login page

  @regression
  Scenario: Login with DataTable credentials
    When I login with credentials:
      | username | testuser@example.com |
      | password | Test@1234            |
    Then I should be redirected to the dashboard

  @regression
  Scenario Outline: Login with multiple user roles
    When I enter username "<username>"
    And I enter password "<password>"
    And I click the login button
    Then <result>

    Examples:
      | username              | password      | result                                         |
      | admin@example.com     | Admin@1234    | I should be redirected to the dashboard        |
      | user@example.com      | User@1234     | I should be redirected to the dashboard        |
      | wrong@example.com     | wrong123      | I should see an error message "invalid"        |
      | blocked@example.com   | Blocked@1234  | I should see an error message "blocked"        |

  @smoke
  Scenario: Login page has required elements
    Then the element "input[type='email'], input[name='username']" should be visible
    And the element "input[type='password']" should be visible
    And the element "button[type='submit']" should be visible
