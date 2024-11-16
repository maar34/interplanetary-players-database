// modules/PlaybackDataManager.js

export class PlaybackDataManager {
  constructor() {
    this.storageKey = 'playbackData';
    this.loadData();
  }

  /**
   * Loads playback data from localStorage.
   */
  loadData() {
    const data = localStorage.getItem(this.storageKey);
    this.playbackData = data ? JSON.parse(data) : {};
  }

  /**
   * Saves playback data to localStorage.
   */
  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.playbackData));
  }

  /**
   * Saves playback data for a specific player.
   * @param {string} userId 
   * @param {number} playerId 
   * @param {string} songName 
   * @param {string} artistName 
   * @param {number} playCount 
   * @param {number} playDuration 
   * @param {number} system_rightascension 
   * @param {number} system_declination 
   */
  savePlaybackData(userId, playerId, songName, artistName, playCount, playDuration, system_rightascension, system_declination) {
    if (!this.playbackData[playerId]) {
      this.playbackData[playerId] = [];
    }
    this.playbackData[playerId].push({
      userId,
      songName,
      artistName,
      playCount,
      playDuration,
      system_rightascension,
      system_declination,
      timestamp: new Date().toISOString()
    });
    this.saveData();
  }

  /**
   * Retrieves playback data for a specific player.
   * @param {number} playerId 
   * @returns {Array} Playback data array.
   */
  getPlaybackData(playerId) {
    return this.playbackData[playerId] || [];
  }

  /**
   * Clears playback data for a specific player.
   * @param {number} playerId 
   */
  clearPlaybackData(playerId) {
    delete this.playbackData[playerId];
    this.saveData();
  }
}
