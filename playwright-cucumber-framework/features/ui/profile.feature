@ui @regression
Feature: User Profile Management
  As a logged-in user
  I want to view and update my profile
  So that my account information stays accurate

  Background:
    Given I am logged in as "standard_user"
    And I navigate to "/profile"

  @smoke
  Scenario: Profile page displays user information
    Then I should see "testuser"
    And the element "[data-testid='profile-email'], .profile-email" should be visible

  @regression
  Scenario: User can update their name
    When I click on "[data-testid='edit-profile'], .edit-profile-btn"
    And  I fill "[data-testid='first-name'], input[name='firstName']" with "Updated"
    And  I fill "[data-testid='last-name'],  input[name='lastName']"  with "Name"
    And  I click on "[data-testid='save-profile'], button.save-btn"
    Then I should see "Updated"

  @regression
  Scenario: User can cancel editing without saving
    When I click on "[data-testid='edit-profile'], .edit-profile-btn"
    And  I fill "[data-testid='first-name'], input[name='firstName']" with "Should Not Save"
    And  I click on "[data-testid='cancel-edit'], button.cancel"
    Then I should not see "Should Not Save"

  @regression
  Scenario: User can change their password
    When I click on "[data-testid='change-password'], .change-password-btn"
    And  I fill "[data-testid='current-password'], input[name='currentPassword']" with "Test@1234"
    And  I fill "[data-testid='new-password'],     input[name='newPassword']"     with "NewPass@5678"
    And  I fill "[data-testid='confirm-password'], input[name='confirmPassword']" with "NewPass@5678"
    And  I click on "[data-testid='update-password'], button.update-password"
    Then I should see "password updated"

  @regression
  Scenario: Password change fails with wrong current password
    When I click on "[data-testid='change-password'], .change-password-btn"
    And  I fill "[data-testid='current-password'], input[name='currentPassword']" with "WrongPass@1234"
    And  I fill "[data-testid='new-password'],     input[name='newPassword']"     with "NewPass@5678"
    And  I fill "[data-testid='confirm-password'], input[name='confirmPassword']" with "NewPass@5678"
    And  I click on "[data-testid='update-password'], button.update-password"
    Then I should see an error message "incorrect"

  @regression
  Scenario: Password mismatch shows validation error
    When I click on "[data-testid='change-password'], .change-password-btn"
    And  I fill "[data-testid='new-password'],     input[name='newPassword']"     with "NewPass@5678"
    And  I fill "[data-testid='confirm-password'], input[name='confirmPassword']" with "DifferentPass@9"
    And  I click on "[data-testid='update-password'], button.update-password"
    Then I should see "passwords do not match"
