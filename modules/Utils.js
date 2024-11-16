export class Utils {
  /**
   * Converts Gregorian date to Julian Date.
   * @param {number} year - The year in Gregorian calendar.
   * @param {number} month - The month in Gregorian calendar.
   * @param {number} day - The day in Gregorian calendar.
   * @returns {number} Julian Date.
   */
  static gregorianToJulian(year, month, day) {
      if (month <= 2) {
          year -= 1;
          month += 12;
      }
      const A = Math.floor(year / 100);
      const B = 2 - A + Math.floor(A / 4);
      return Math.floor(365.25 * (year + 4716)) +
             Math.floor(30.6001 * (month + 1)) +
             day + B - 1524.5;
  }

  /**
   * Converts Julian Date to Gregorian date string in format "DD-MM-YYYY".
   * @param {number} julian - The Julian date.
   * @returns {string} Formatted date string "DD-MM-YYYY".
   */
  static julianToDate(julian) {
      const jd = julian + 0.5;
      const Z = Math.floor(jd);
      const F = jd - Z;
      let A = Z;

      if (Z >= 2299161) {
          const alpha = Math.floor((Z - 1867216.25) / 36524.25);
          A += 1 + alpha - Math.floor(alpha / 4);
      }

      const B = A + 1524;
      const C = Math.floor((B - 122.1) / 365.25);
      const D = Math.floor(365.25 * C);
      const E = Math.floor((B - D) / 30.6001);

      const day = B - D - Math.floor(30.6001 * E) + F;
      const month = (E < 14) ? E - 1 : E - 13;
      const year = (month > 2) ? C - 4716 : C - 4715;

      return `${Math.floor(day).toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
  }

  /**
   * Linearly interpolates between two values.
   * @param {number} start - The start value.
   * @param {number} end - The end value.
   * @param {number} t - Interpolation factor (0 to 1).
   * @returns {number} Interpolated value.
   */
  static interpolate(start, end, t) {
      return (1 - t) * start + t * end;
  }

  /**
   * Normalizes an index to ensure it stays within the valid range.
   * @param {number} index - The value to normalize.
   * @param {number} max - The maximum allowed value.
   * @returns {number} Normalized index within the range [0, max].
   */
  static normalizeIndex(index, max) {
      return Math.max(0, Math.min(index, max));
  }

  // Additional utility functions can be added here as needed
}
