@ui @regression @email
Feature: Email Verification Flow
  As a new user who has registered
  I want to verify my email address
  So that I can fully activate my account

  Scenario: New user receives verification email after registration
    Given I navigate to "/register"
    When I fill "[data-testid='first-name'], input[name='firstName']" with "Jane"
    And  I fill "[data-testid='last-name'],  input[name='lastName']"  with "Smith"
    And  I fill "[data-testid='email'],       input[type='email']"    with "jane.smith.verify@test.com"
    And  I fill "[data-testid='password'],    input[name='password']" with "Secure@Pass123"
    And  I click on "[data-testid='register-btn'], button[type='submit']"
    Then I should see "check your email"
    When I wait for an email to "jane.smith.verify@test.com" with subject "Verify"
    Then the email should have subject "Verify"
    And  the email body should contain "verify"

  Scenario: User can verify email via link
    Given I wait for an email to "jane.smith.verify@test.com" with subject "Verify"
    When I extract the verification link from the email
    And  I click the verification link from the email
    Then I should see "verified"
    And  the URL should contain "verified"

  Scenario: Password reset email is received
    Given I am on the login page
    When I click on "[data-testid='forgot-password'], a[href*='forgot']"
    And  I fill "[data-testid='email'], input[type='email']" with "testuser@example.com"
    And  I click on "button[type='submit']"
    Then I should see "reset link sent"
    When I wait for an email to "testuser@example.com" with subject "Reset"
    Then the email should have subject "Reset"
    When I extract the verification link from the email
    And  I click the verification link from the email
    Then the URL should contain "reset-password"
