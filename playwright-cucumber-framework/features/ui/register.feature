@ui @regression
Feature: User Registration
  As a new visitor
  I want to create an account
  So that I can access the application

  Background:
    Given I navigate to "/register"

  @smoke
  Scenario: Successful registration with valid data
    When I fill "[data-testid='first-name'], input[name='firstName']" with "John"
    And I fill "[data-testid='last-name'],  input[name='lastName']"  with "Doe"
    And I fill "[data-testid='email'],       input[type='email']"    with "john.doe.unique@test.com"
    And I fill "[data-testid='password'],    input[name='password']" with "SecurePass@123"
    And I click on "[data-testid='register-btn'], button[type='submit']"
    Then I should be redirected to the dashboard

  @regression
  Scenario: Registration fails with already-used email
    When I fill "[data-testid='email'], input[type='email']" with "testuser@example.com"
    And I fill "[data-testid='password'], input[name='password']" with "SecurePass@123"
    And I click on "[data-testid='register-btn'], button[type='submit']"
    Then I should see an error message "email already exists"

  @regression
  Scenario: Registration fails with invalid email format
    When I fill "[data-testid='email'], input[type='email']" with "not-an-email"
    And I click on "[data-testid='register-btn'], button[type='submit']"
    Then I should see "invalid email"

  @regression
  Scenario Outline: Password strength validation
    When I fill "[data-testid='password'], input[name='password']" with "<password>"
    Then I should see "<strength>"

    Examples:
      | password         | strength |
      | 1234             | weak     |
      | Password1        | medium   |
      | P@ssw0rd!Secure  | strong   |

  @regression
  Scenario: Mismatched passwords show error
    When I fill "[data-testid='password'],         input[name='password']"        with "SecurePass@123"
    And  I fill "[data-testid='confirm-password'], input[name='confirmPassword']" with "DifferentPass@456"
    And I click on "[data-testid='register-btn'], button[type='submit']"
    Then I should see "passwords do not match"

  @regression
  Scenario: Link to login page is present
    Then the element "a[href*='login'], [data-testid='login-link']" should be visible
