## ADDED Requirements

### Requirement: Admin quota form SHALL collect username and quota
The system SHALL provide an admin form with a username input and a model call quota input to grant usage permission.

#### Scenario: Default quota value is prefilled
- **WHEN** the admin permission form is first shown after successful gate verification
- **THEN** the quota field SHALL default to `10`

#### Scenario: Username and quota fields are both visible
- **WHEN** the admin permission form is displayed
- **THEN** the user SHALL see one field for username and one field for model call quota

### Requirement: Form validation SHALL block invalid submissions
The system SHALL validate form inputs before submission and SHALL prevent requests when validation fails.

#### Scenario: Username is required
- **WHEN** the admin submits the form with an empty username
- **THEN** the system SHALL block submission and show a username-required error

#### Scenario: Quota must be a positive integer
- **WHEN** the admin submits a quota that is empty, non-numeric, zero, or negative
- **THEN** the system SHALL block submission and show a quota validation error

### Requirement: Form submission SHALL provide success/failure feedback
The system SHALL submit valid admin grant requests via the service layer and SHALL provide clear feedback on result.

#### Scenario: Submission succeeds
- **WHEN** the admin submits valid username and quota values and the service request succeeds
- **THEN** the system SHALL show a success state/message and keep the form available for further grants

#### Scenario: Submission fails
- **WHEN** the admin submits valid input but the service request fails
- **THEN** the system SHALL show an error message and preserve the current input values for retry
