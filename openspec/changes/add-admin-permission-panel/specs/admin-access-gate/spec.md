## ADDED Requirements

### Requirement: Admin panel access SHALL require password verification
The system SHALL require users to pass an administrator password gate before they can access the admin permission panel.

#### Scenario: Access denied before verification
- **WHEN** the user navigates to the admin panel view for the first time in the current session
- **THEN** the system SHALL show a password verification form instead of the permission form

#### Scenario: Access granted with correct password
- **WHEN** the user enters the correct administrator password and submits
- **THEN** the system SHALL switch to the admin permission form in the same view

#### Scenario: Access blocked with incorrect password
- **WHEN** the user submits an incorrect administrator password
- **THEN** the system SHALL keep the user on the password gate and show an error message

### Requirement: Default administrator password SHALL be predefined
The system SHALL use `liao123...` as the default administrator password for gate verification in this change.

#### Scenario: Default password is accepted
- **WHEN** the user inputs `liao123...` as the administrator password
- **THEN** the system SHALL treat verification as successful

### Requirement: Admin panel UI SHALL match existing style system
The admin panel entry and gate UI SHALL reuse existing visual components and style language used by other pages.

#### Scenario: Existing design tokens are reused
- **WHEN** the admin gate UI is rendered
- **THEN** input fields, buttons, card containers, colors, and spacing SHALL be consistent with existing components in the application
