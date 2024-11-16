export class PlaybackDataManager {
  constructor() {
      this.storageKey = 'playbackData';
      this.playbackData = {}; // Initialize an empty object for playback data
      this.loadData();
  }

  /**
   * Loads playback data from localStorage.
   */
  loadData() {
      try {
          const data = localStorage.getItem(this.storageKey);
          this.playbackData = data ? JSON.parse(data) : {};
          console.log('Playback data loaded:', this.playbackData);
      } catch (error) {
          console.error('Error loading playback data from localStorage:', error);
          this.playbackData = {}; // Reset to an empty object on error
      }
  }

  /**
   * Saves playback data to localStorage.
   */
  saveData() {
      try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.playbackData));
          console.log('Playback data saved successfully.');
      } catch (error) {
          console.error('Error saving playback data to localStorage:', error);
      }
  }

  /**
   * Saves playback data for a specific player.
   * @param {string} userId - ID of the user.
   * @param {number} playerId - ID of the player.
   * @param {string} songName - Name of the song.
   * @param {string} artistName - Name of the artist.
   * @param {number} playCount - Number of plays.
   * @param {number} playDuration - Duration of playback in seconds.
   * @param {number} system_rightascension - Right ascension of the system.
   * @param {number} system_declination - Declination of the system.
   */
  savePlaybackData(userId, playerId, songName, artistName, playCount, playDuration, system_rightascension, system_declination) {
      try {
          if (!this.playbackData[playerId]) {
              this.playbackData[playerId] = [];
          }

          const playbackEntry = {
              userId,
              songName,
              artistName,
              playCount,
              playDuration,
              system_rightascension,
              system_declination,
              timestamp: new Date().toISOString()
          };

          this.playbackData[playerId].push(playbackEntry);
          console.log(`Playback data saved for player ${playerId}:`, playbackEntry);

          this.saveData();
      } catch (error) {
          console.error('Error saving playback data:', error);
      }
  }

  /**
   * Retrieves playback data for a specific player.
   * @param {number} playerId - ID of the player.
   * @returns {Array} Playback data array or an empty array if no data exists.
   */
  getPlaybackData(playerId) {
      try {
          return this.playbackData[playerId] || [];
      } catch (error) {
          console.error(`Error retrieving playback data for player ${playerId}:`, error);
          return [];
      }
  }

  /**
   * Clears playback data for a specific player.
   * @param {number} playerId - ID of the player.
   */
  clearPlaybackData(playerId) {
      try {
          if (this.playbackData[playerId]) {
              delete this.playbackData[playerId];
              console.log(`Playback data cleared for player ${playerId}.`);
              this.saveData();
          } else {
              console.warn(`No playback data found for player ${playerId} to clear.`);
          }
      } catch (error) {
          console.error(`Error clearing playback data for player ${playerId}:`, error);
      }
  }

  /**
   * Clears all playback data.
   */
  clearAllPlaybackData() {
      try {
          this.playbackData = {};
          console.log('All playback data cleared.');
          this.saveData();
      } catch (error) {
          console.error('Error clearing all playback data:', error);
      }
  }
}
