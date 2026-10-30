import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import config from "./config.js";
export * from "./formatters.js";

// JSON Response Utilities
export function jsonSuccess(data = {}, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status }
  );
}

export function jsonError(message = "An error occurred", status = 400, details = null) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
    },
    { status }
  );
}

// Convert string to ObjectId if valid, else returns original string
export function toObjectId(id) {
  if (!id) return null;
  if (id instanceof ObjectId) return id;
  if (typeof id === "string" && ObjectId.isValid(id) && id.length === 24) {
    try {
      return new ObjectId(id);
    } catch {
      return id;
    }
  }
  return id;
}

// Validation functions using limits from config.json
export function validateItemInput(data) {
  const { titleMin, titleMax, descriptionMin, descriptionMax, locationMin, locationMax } =
    config.validationLimits;

  const errors = [];

  if (!data.title || typeof data.title !== "string" || data.title.trim().length < titleMin) {
    errors.push(`Title must be at least ${titleMin} characters long.`);
  } else if (data.title.trim().length > titleMax) {
    errors.push(`Title cannot exceed ${titleMax} characters.`);
  }

  if (
    !data.description ||
    typeof data.description !== "string" ||
    data.description.trim().length < descriptionMin
  ) {
    errors.push(`Description must be at least ${descriptionMin} characters long.`);
  } else if (data.description.trim().length > descriptionMax) {
    errors.push(`Description cannot exceed ${descriptionMax} characters.`);
  }

  if (!data.type || !config.itemTypes.includes(data.type)) {
    errors.push(`Type must be one of: ${config.itemTypes.join(", ")}`);
  }

  if (!data.location || typeof data.location !== "string" || data.location.trim().length < locationMin) {
    errors.push(`Location must be at least ${locationMin} characters.`);
  } else if (data.location.trim().length > locationMax) {
    errors.push(`Location cannot exceed ${locationMax} characters.`);
  }

  if (!data.dateOccurred) {
    errors.push("Date occurred is required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateClaimInput(data) {
  const { proofDescriptionMin, proofDescriptionMax } = config.validationLimits;
  const errors = [];

  if (
    !data.proofDescription ||
    typeof data.proofDescription !== "string" ||
    data.proofDescription.trim().length < proofDescriptionMin
  ) {
    errors.push(`Proof description must be at least ${proofDescriptionMin} characters.`);
  } else if (data.proofDescription.trim().length > proofDescriptionMax) {
    errors.push(`Proof description cannot exceed ${proofDescriptionMax} characters.`);
  }

  if (!data.itemId) {
    errors.push("Item ID is required to claim an item.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateReturnInput(data) {
  const errors = [];
  if (!data.itemId) errors.push("Item ID is required.");
  if (!data.claimId) errors.push("Claim ID is required.");
  if (!data.receivedBy || typeof data.receivedBy !== "string" || !data.receivedBy.trim()) {
    errors.push("Name or Student ID of recipient is required.");
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRegisterInput(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Full name is required (minimum 2 characters).");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push("A valid email address is required.");
  }

  if (!data.studentId || data.studentId.trim().length < 4) {
    errors.push("Student ID is required (minimum 4 characters).");
  }

  if (!data.department || !data.department.trim()) {
    errors.push("Academic department is required.");
  }

  if (!data.password || data.password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Mask sensitive info for privacy
export function maskSensitiveDetails(item, currentUserId, userRole) {
  if (!item) return item;
  const isOwner = currentUserId && item.reportedBy && item.reportedBy.toString() === currentUserId.toString();
  const isAdmin = userRole === "admin";

  if (isOwner || isAdmin) {
    return item;
  }

  const sanitized = { ...item };
  if (sanitized.contactPreference && sanitized.contactPreference.toLowerCase().includes("phone")) {
    sanitized.contactPreference = "Contact via Lost & Found Desk";
  }
  return sanitized;
}
