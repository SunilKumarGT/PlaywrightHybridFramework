@ai @regression
Feature: AI-Powered Test Generation & Intelligent Assertions
  As a QA engineer
  I want AI to help write and verify tests
  So that test coverage improves automatically and intelligently

  @smoke @ai
  Scenario: AI generates test cases for login user story
    When AI generates test cases for:
      """
      User Story: As a registered user, I want to log in with my email and
      password so I can access my account.

      Acceptance Criteria:
      - Login form has email and password fields
      - Valid credentials redirect to dashboard
      - Invalid credentials show error message
      - Account is locked after 5 failed attempts
      - "Remember me" keeps session for 30 days
      - "Forgot password" link is visible
      """
    Then AI should generate at least 6 test cases

  @ai @regression
  Scenario: AI generates Gherkin for product search
    When AI generates Gherkin scenarios for:
      """
      Product search functionality:
      - User types a keyword in the search bar
      - Results update as user types (live search)
      - User can filter results by category, price range, rating
      - Sort results by relevance, price, newest
      - No results state is shown gracefully
      - Search query is preserved in the URL
      """
    Then the element "body" should be visible

  @ai @regression
  Scenario: AI performs intelligent API contract verification
    Given I have a valid API client
    And I authenticate with bearer token "valid-test-token"
    When I send a GET request to "/api/users"
    Then the response status code should be 200
    And AI should verify that "every user object has a non-empty string email field"
    And AI should verify that "no passwords or sensitive tokens are exposed in the response"
    And AI should verify that "the response follows RESTful array format with valid data types"

  @ai @regression
  Scenario: AI detects XSS vulnerability in search
    Given I am logged in as "standard_user"
    And I am on the products page
    When I search for "<script>alert('xss')</script>"
    And I analyze the current page screenshot for "XSS script injection, unescaped content, security vulnerabilities"
    Then the AI analysis should have no critical issues

  @ai @regression
  Scenario: AI validates checkout form completeness
    Given I am logged in as "standard_user"
    And I navigate to "/checkout"
    When I analyze the current page screenshot for "form completeness, all required fields present, clear labels, proper input types"
    Then the AI analysis should have no high severity issues

  @ai @regression
  Scenario: AI verifies error messages are user-friendly
    Given I am on the login page
    When I enter username "wrong@example.com"
    And I enter password "wrongpass"
    And I click the login button
    And I analyze the current page screenshot for "error message clarity, user-friendliness, helpful guidance"
    Then the AI analysis should have no critical issues
    And the AI confidence score should be at least 0.75

  @ai @regression
  Scenario: AI checks mobile responsiveness
    Given I navigate to "/"
    When I set viewport to mobile
    And I analyze the current page screenshot for "mobile layout, touch targets, text readability, no overflow"
    Then the AI analysis should have no critical issues
