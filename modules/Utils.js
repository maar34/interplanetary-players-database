// modules/Utils.js

export class Utils {
    /**
     * Converts Gregorian date to Julian Date.
     * @param {number} year 
     * @param {number} month 
     * @param {number} day 
     * @returns {number} Julian Date
     */
    static gregorianToJulian(year, month, day) {
      if (month <= 2) {
        year -= 1;
        month += 12;
      }
      let A = Math.floor(year / 100);
      let B = 2 - A + Math.floor(A / 4);
      return Math.floor(365.25 * (year + 4716)) +
             Math.floor(30.6001 * (month + 1)) +
             day + B - 1524.5;
    }
  
    /**
     * Converts Julian Date to Gregorian date string.
     * @param {number} julian 
     * @returns {string} Formatted date string
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
      
      return `${Math.floor(day)}-${month}-${year}`;
    }
  
    /**
     * Linearly interpolates between two values.
     * @param {number} start 
     * @param {number} end 
     * @param {number} t 
     * @returns {number} Interpolated value
     */
    static interpolate(start, end, t) {
      return (1 - t) * start + t * end;
    }
  
    /**
     * Normalizes an index to a range.
     * @param {number} index 
     * @param {number} max 
     * @returns {number} Normalized index
     */
    static normalizeIndex(index, max) {
      return Math.max(0, Math.min(index, max));
    }
  
    // Add more utility functions as needed
  }
  