// js/utils/Validator.js

export class Validator {

  static isNonEmpty(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  static isPositiveNumber(value) {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }

  static isNonNegativeNumber(value) {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  }

  // For adjustments: must be a non-zero integer (positive or negative)
  static isNonZeroInteger(value) {
    const num = parseInt(value);
    return !isNaN(num) && num !== 0;
  }

  // Pass excludeId when editing so the product doesn't conflict with itself
  static isUniqueSKU(sku, products, excludeId = null) {
    return !products.some(p => p.sku === sku && p.id !== excludeId);
  }

  static isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
