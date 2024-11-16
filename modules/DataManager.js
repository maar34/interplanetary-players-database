// modules/DataManager.js

import { Utils } from './Utils.js';

export class DataManager {
  constructor() {
    this.gameData = null;
    this.exoData = null;
  }

  /**
   * Loads game-specific JSON data and exoplanet data.
   * @param {string} gameParam - The game parameter from URL.
   */
  async loadData(gameParam) {
    try {
      this.gameData = await loadJSON(`data/${gameParam}.min.json`);
      this.exoData = await loadJSON("data/exoplanetData.min.json");
      console.log('Data loaded successfully.');
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  /**
   * Interpolates transit data based on index.
   * @param {number} index - Normalized index [0, 1].
   * @returns {object} Interpolated transit data.
   */
  interpolateTransitData(index) {
    const transits = this.exoData['Kepler-47']['Maar_World']['transits'];
    const numTransits = transits.length;

    const pos = index * (numTransits - 1);
    const lowerIndex = Math.floor(pos);
    const upperIndex = Math.ceil(pos);
    const t = pos - lowerIndex;

    if (lowerIndex === upperIndex || upperIndex >= numTransits) {
      return {
        ...transits[lowerIndex],
        exactTransitDate: Utils.julianToDate(transits[lowerIndex].BJD)
      };
    }

    const lowerTransit = transits[lowerIndex];
    const upperTransit = transits[upperIndex];

    const interpolate = (start, end, t) => Utils.interpolate(start, end, t);

    const interpolatedBJD = interpolate(lowerTransit.BJD, upperTransit.BJD, t) + 2455000;
    const exactTransitDate = Utils.julianToDate(interpolatedBJD);

    return {
      normalizedB: interpolate(lowerTransit.Normalized_b, upperTransit.Normalized_b, t),
      normalizedDuration: interpolate(lowerTransit.Normalized_Duration_hrs, upperTransit.Normalized_Duration_hrs, t),
      b: interpolate(lowerTransit.b, upperTransit.b, t),
      duration: interpolate(lowerTransit.Duration_hrs, upperTransit.Duration_hrs, t),
      transitDate: exactTransitDate,
      normalizedBJD: interpolate(lowerTransit.Normalized_BJD, upperTransit.Normalized_BJD, t)
    };
  }

  /**
   * Generates orbit data based on index.
   * @param {number} index - Normalized index [0, 1].
   * @returns {object} Orbit data for planets b, c, d.
   */
  generateOrbitData(index) {
    const json = this.exoData;
    
    const getOrbitData = (orbitalPeriod, index) => {
      const normalizedIndex = index * orbitalPeriod;
      const phase = (normalizedIndex % orbitalPeriod) / orbitalPeriod * 360; // degrees
      const orbitPosition = (Math.sin(phase) + 1) / 2;
      const dayInOrbit = normalizedIndex % orbitalPeriod;
      return { dayInOrbit, orbitPosition };
    };

    const periodB = json["Kepler-47"]["Planets"]["Kepler-47 b"]["orbital_period_days"];
    const periodC = json["Kepler-47"]["Planets"]["Kepler-47 c"]["orbital_period_days"];
    const periodD = json["Kepler-47"]["Planets"]["Kepler-47 d"]["orbital_period_days"];

    return {
      "b": getOrbitData(periodB, index),
      "c": getOrbitData(periodC, index * periodC / periodB),
      "d": getOrbitData(periodD, index * periodD / periodB)
    };
  }

  /**
   * Sets the current index based on today's date.
   * @returns {number} Normalized index for today.
   */
  setCurrentIndexToToday() {
    const transits = this.exoData['Kepler-47']['Maar_World']['transits'];
    const numTransits = transits.length;

    const today = new Date();
    const todayBJD = Utils.gregorianToJulian(today.getFullYear(), today.getMonth() + 1, today.getDate()) - 2455000;

    let pastTransitIndex = 0;
    let futureTransitIndex = numTransits - 1;
    for (let i = 0; i < numTransits; i++) {
      if (transits[i].BJD < todayBJD) {
        pastTransitIndex = i;
      } else {
        futureTransitIndex = i;
        break;
      }
    }

    const pastBJD = transits[pastTransitIndex].BJD;
    const futureBJD = transits[futureTransitIndex].BJD;
    const t = (todayBJD - pastBJD) / (futureBJD - pastBJD);
    let index = (pastTransitIndex + t) / (numTransits - 1);

    index = Utils.normalizeIndex(index, numTransits - 1);
    return index;
  }
}
