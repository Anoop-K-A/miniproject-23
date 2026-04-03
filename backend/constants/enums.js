/**
 * @file Centralized enums for the application
 * Ensures consistency across the codebase
 */

// User roles
const USER_ROLES = {
  ADMIN: "admin",
  FACULTY: "faculty",
  AUDITOR: "auditor",
  STAFF_ADVISOR: "staff-advisor",
};

// User status
const USER_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  INACTIVE: "inactive",
  REJECTED: "rejected",
};

// Event report status
const EVENT_REPORT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUBMITTED: "submitted",
};

// Course file review status
const FILE_REVIEW_STATUS = {
  PENDING: "pending",
  SUBMITTED: "submitted",
  IN_REVIEW: "in_review",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Responsibility status
const RESPONSIBILITY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  COMPLETED: "completed",
};

// Student placement status
const PLACEMENT_STATUS = {
  NOT_STARTED: "Not Started",
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  PLACED: "Placed",
  REJECTED: "Rejected",
  NOT_INTERESTED: "Not Interested",
};

// Event types
const EVENT_TYPES = {
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  CONFERENCE: "Conference",
  TRAINING: "Training",
  WEBINAR: "Webinar",
  GUEST_LECTURE: "Guest Lecture",
  COMPETITION: "Competition",
  OTHER: "Other",
};

// Common pagination
const PAGINATION = {
  DEFAULT_LIMIT: 10,
  DEFAULT_PAGE: 1,
  MAX_LIMIT: 100,
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  EVENT_REPORT_STATUS,
  FILE_REVIEW_STATUS,
  RESPONSIBILITY_STATUS,
  PLACEMENT_STATUS,
  EVENT_TYPES,
  PAGINATION,
};
