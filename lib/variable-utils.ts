/**
 * Variable utilities for wizemail
 * Handles variable detection, usage tracking, and merge tag operations
 */

import type { EmailRow } from './types';

/**
 * Finds all variable tags ({{variableName}}) in HTML content
 * Returns array of unique variable names found
 */
export function findVariablesInHtml(html: string): string[] {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const variables = new Set<string>();

  let match;
  while ((match = variableRegex.exec(html)) !== null) {
    const varName = match[1].trim();
    if (varName) {
      variables.add(varName);
    }
  }

  return Array.from(variables);
}

/**
 * Counts occurrences of each variable in HTML content
 * Returns Record<variableName, count>
 */
export function countVariableUsage(html: string): Record<string, number> {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const usage: Record<string, number> = {};

  let match;
  while ((match = variableRegex.exec(html)) !== null) {
    const varName = match[1].trim();
    if (varName) {
      usage[varName] = (usage[varName] || 0) + 1;
    }
  }

  return usage;
}

/**
 * Finds variables that are defined but not used in the HTML
 */
export function getOrphanedVariables(
  definedVariables: Record<string, string>,
  html: string
): string[] {
  const usedVariables = new Set(findVariablesInHtml(html));
  const definedNames = Object.keys(definedVariables);

  return definedNames.filter(name => !usedVariables.has(name));
}

/**
 * Finds variables that are used in HTML but not defined
 */
export function getUndefinedVariables(
  definedVariables: Record<string, string>,
  html: string
): string[] {
  const usedVariables = findVariablesInHtml(html);
  const definedNames = new Set(Object.keys(definedVariables));

  return usedVariables.filter(name => !definedNames.has(name));
}

/**
 * Gets comprehensive variable analysis for an email
 */
export function analyzeVariableUsage(
  definedVariables: Record<string, string>,
  html: string
): {
  usage: Record<string, number>;
  orphaned: string[];
  undefined: string[];
  totalUsed: number;
  totalDefined: number;
} {
  const usage = countVariableUsage(html);
  const orphaned = getOrphanedVariables(definedVariables, html);
  const undefined = getUndefinedVariables(definedVariables, html);

  return {
    usage,
    orphaned,
    undefined,
    totalUsed: Object.keys(usage).length,
    totalDefined: Object.keys(definedVariables).length
  };
}

/**
 * Applies variable substitution to HTML content
 * Enhanced version that handles edge cases
 */
export function applyVariables(
  html: string,
  variables: Record<string, string>
): string {
  let result = html;

  // Sort by length (longest first) to avoid partial replacements
  const sortedVars = Object.keys(variables).sort((a, b) => b.length - a.length);

  for (const varName of sortedVars) {
    const value = variables[varName] || '';
    const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

/**
 * Extracts all text content from email rows for variable analysis
 * Useful for getting the full HTML content to analyze
 */
export function extractEmailContent(rows: EmailRow[]): string {
  const content: string[] = [];

  for (const row of rows) {
    for (const column of row.columns) {
      // Extract text from different section types
      if (column.type === 'text' && column.content.bodyText) {
        content.push(column.content.bodyText);
      }
      if (column.type === 'hero' && column.content.headline) {
        content.push(column.content.headline);
        if (column.content.subheadline) content.push(column.content.subheadline);
      }
      if (column.type === 'cta' && column.content.buttonText) {
        content.push(column.content.buttonText);
      }
      if (column.type === 'header' && column.content.logoText) {
        content.push(column.content.logoText);
      }
      if (column.type === 'footer' && column.content.companyName) {
        content.push(column.content.companyName);
        if (column.content.companyAddress) content.push(column.content.companyAddress);
      }
      // Add other section types as needed
    }
  }

  return content.join(' ');
}

/**
 * Validates that all required variables are defined
 * Useful for email campaigns that must have certain variables
 */
export function validateRequiredVariables(
  html: string,
  requiredVariables: string[]
): { missing: string[]; valid: boolean } {
  const usedVariables = new Set(findVariablesInHtml(html));
  const missing = requiredVariables.filter(req => !usedVariables.has(req));

  return {
    missing,
    valid: missing.length === 0
  };
}