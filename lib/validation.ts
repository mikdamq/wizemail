/**
 * Validation utilities for wizemail
 * Handles variable names, email content, and other user inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates variable names for merge tags
 * Rules:
 * - Alphanumeric characters + underscore + hyphen only
 * - No spaces or special characters
 * - Max 50 characters
 * - Not empty
 * - Not a reserved word
 */
export function validateVariableName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Variable name cannot be empty' };
  }

  const trimmed = name.trim();

  if (trimmed.length > 50) {
    return { isValid: false, error: 'Variable name must be 50 characters or less' };
  }

  // Only allow alphanumeric, underscore, and hyphen
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'Variable name can only contain letters, numbers, underscores, and hyphens'
    };
  }

  // Reserved words that might conflict with email properties
  const reservedWords = [
    'subject', 'from', 'to', 'cc', 'bcc', 'replyto', 'html', 'text',
    'date', 'time', 'email', 'name', 'first', 'last', 'full',
    'id', 'key', 'value', 'type', 'class', 'style'
  ];

  if (reservedWords.includes(trimmed.toLowerCase())) {
    return {
      isValid: false,
      error: `"${trimmed}" is a reserved word and cannot be used as a variable name`
    };
  }

  return { isValid: true };
}

/**
 * Validates variable value (more lenient, but prevents obvious issues)
 */
export function validateVariableValue(value: string): ValidationResult {
  if (value.length > 1000) {
    return { isValid: false, error: 'Variable value must be 1000 characters or less' };
  }

  return { isValid: true };
}

/**
 * Checks if a variable name already exists in the given set
 */
export function isVariableNameUnique(name: string, existingNames: string[]): boolean {
  return !existingNames.some(existing => existing.toLowerCase() === name.toLowerCase());
}

/**
 * Validates an entire set of variables for duplicates and other issues
 */
export function validateVariableSet(variables: Record<string, string>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const names = Object.keys(variables);

  // Check each variable individually
  for (const name of names) {
    const result = validateVariableName(name);
    if (!result.isValid) {
      errors[name] = result.error!;
    }

    const valueResult = validateVariableValue(variables[name]);
    if (!valueResult.isValid) {
      errors[name] = valueResult.error!;
    }
  }

  // Check for duplicates (case-insensitive)
  const seen = new Set<string>();
  for (const name of names) {
    const lowerName = name.toLowerCase();
    if (seen.has(lowerName)) {
      errors[name] = 'Variable name already exists (case-insensitive)';
    }
    seen.add(lowerName);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}