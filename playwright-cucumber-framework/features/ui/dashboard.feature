@ui @regression
Feature: Dashboard Functionality
  As a logged-in user
  I want to view and interact with my dashboard
  So that I can manage my account and activities

  Background:
    Given I am logged in as "standard_user"

  @smoke
  Scenario: Dashboard loads successfully
    Then the URL should contain "dashboard"
    And I should see "Welcome"

  @regression
  Scenario: User can navigate to different sections
    When I click on "Profile"
    Then the URL should contain "profile"

  @regression
  Scenario: User can log out
    When I click on "Logout"
    Then I should be redirected to the login page
    And the URL should contain "login"

  @regression
  Scenario: Dashboard displays statistics
    Then I should see at least 1 stats card

  @regression
  Scenario: Search functionality works
    When I fill "[data-testid='search-input'], input[type='search']" with "test query"
    And I press "Enter" key
    Then the URL should contain "search"
