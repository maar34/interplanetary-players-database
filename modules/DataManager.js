import { Utils } from './Utils.js';
import { Constants } from './Constants.js';

export class DataManager {
    constructor() {
        this.cacheExpiryMinutes = 10; // Cache expiry in minutes
    }

    /**
     * Fetches track data and caches it.
     * @param {string} trackId - The track ID.
     * @returns {Promise<void>}
     */
    async fetchTrackData(trackId) {
        try {
            if (!trackId || typeof trackId !== 'string') {
                console.error('Invalid trackId format. Must be a non-empty string.');
                throw new Error('Invalid trackId format.');
            }
    
            console.log(`Fetching track data for trackId: ${trackId}`);
    
            // Check cache first
            const cachedData = Constants.getTrackData(trackId);
            if (cachedData) {
                console.log('Using cached track data:', cachedData);
                return;
            }
    
            // Fetch from server if not in cache
            const BASE_URL = 'http://media.maar.world:3001/api';
            const response = await fetch(`${BASE_URL}/tracks/xplore/${trackId}`);
    
            if (!response.ok) {
                throw new Error(`Failed to fetch track data: ${response.statusText} (${response.status})`);
            }
    
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Unknown error fetching track data.');
            }
    
            console.log('Track data fetched successfully:', result.track);
    
            // Cache data and update Constants
            Constants.setTrackData(trackId, result.track);
        } catch (error) {
            console.error('Error fetching track data:', error);
            throw error;
        }
    }
    

    /**
     * Generates a consistent cache key for the track ID.
     * @param {string} trackId
     * @returns {string} Cache key for the given trackId.
     */
    getCacheKey(trackId) {
        return `trackData_${trackId}`;
    }

    /**
     * Clears the cache for a specific trackId.
     * @param {string} trackId
     */
    clearCache(trackId) {
        const cacheKey = this.getCacheKey(trackId);
        lscache.remove(cacheKey);
        console.log(`Cache cleared for trackId: ${trackId}`);
    }


    interpolateTransitData(index) {
        const transits = this.exoData?.['Kepler-47']?.['Maar_World']?.['transits'];
        if (!transits) {
            console.error('Transit data is missing or malformed.');
            return null;
        }

        const numTransits = transits.length;
        const pos = index * (numTransits - 1);
        const lowerIndex = Math.floor(pos);
        const upperIndex = Math.ceil(pos);
        const t = pos - lowerIndex;

        // Handle edge cases
        if (lowerIndex === upperIndex || upperIndex >= numTransits) {
            return {
                ...transits[lowerIndex],
                exactTransitDate: Utils.julianToDate(transits[lowerIndex]?.BJD)
            };
        }

        const lowerTransit = transits[lowerIndex];
        const upperTransit = transits[upperIndex];
        const interpolate = (start, end, factor) => Utils.interpolate(start, end, factor);

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
     * Generates orbit data for planets based on a normalized index.
     * @param {number} index - Normalized index [0, 1].
     * @returns {object} Orbit data for planets Kepler-47 b, c, d.
     */
    generateOrbitData(index) {
        const json = this.exoData;

        const getOrbitData = (orbitalPeriod, normalizedIndex) => {
            const phase = (normalizedIndex * orbitalPeriod) % orbitalPeriod;
            const orbitPosition = (Math.sin((phase / orbitalPeriod) * 2 * Math.PI) + 1) / 2;
            const dayInOrbit = normalizedIndex * orbitalPeriod % orbitalPeriod;

            return { dayInOrbit, orbitPosition };
        };

        try {
            const periodB = json?.["Kepler-47"]?.["Planets"]?.["Kepler-47 b"]?.["orbital_period_days"];
            const periodC = json?.["Kepler-47"]?.["Planets"]?.["Kepler-47 c"]?.["orbital_period_days"];
            const periodD = json?.["Kepler-47"]?.["Planets"]?.["Kepler-47 d"]?.["orbital_period_days"];

            if (!periodB || !periodC || !periodD) {
                throw new Error('Orbital period data is missing.');
            }

            return {
                b: getOrbitData(periodB, index),
                c: getOrbitData(periodC, index * (periodC / periodB)),
                d: getOrbitData(periodD, index * (periodD / periodB))
            };
        } catch (error) {
            console.error('Error generating orbit data:', error);
            return null;
        }
    }

    /**
     * Sets the current index based on today's date.
     * @returns {number} Normalized index for today.
     */
    setCurrentIndexToToday() {
        const transits = this.exoData?.['Kepler-47']?.['Maar_World']?.['transits'];
        if (!transits) {
            console.error('Transit data is missing or malformed.');
            return null;
        }

        const numTransits = transits.length;
        const today = new Date();
        const todayBJD = Utils.gregorianToJulian(today.getFullYear(), today.getMonth() + 1, today.getDate()) - 2455000;

        // Find the nearest past and future transits
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

        const pastBJD = transits[pastTransitIndex]?.BJD;
        const futureBJD = transits[futureTransitIndex]?.BJD;

        if (pastBJD === undefined || futureBJD === undefined) {
            console.error('BJD data is missing.');
            return null;
        }

        const t = (todayBJD - pastBJD) / (futureBJD - pastBJD);
        const index = Utils.normalizeIndex(pastTransitIndex + t, numTransits - 1);

        return index;
    }
}
