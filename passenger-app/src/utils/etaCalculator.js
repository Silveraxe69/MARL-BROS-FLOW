/**
 * Get ETA for all buses at a specific stop
 * @param {string} stopId - Stop ID
 * @param {Array} busEtaData - Array of bus ETA data
 * @param {Array} busData - Array of bus data
 * @returns {Array} Array of buses with their ETAs sorted by arrival time
 */
export const getNextBusesAtStop = (stopId, busEtaData, busData) => {
  const busesAtStop = busEtaData.filter(eta => eta.stop_id === stopId);
  
  return busesAtStop
    .map(eta => {
      const bus = busData.find(b => b.bus_id === eta.bus_id);
      return {
        ...eta,
        ...bus,
      };
    })
    .sort((a, b) => a.eta_minutes - b.eta_minutes);
};

/**
 * Format time in minutes to readable string
 * @param {number} minutes
 * @returns {string} Formatted time string
 */
export const formatETA = (minutes) => {
  if (minutes === 0) return 'Arrived';
  if (minutes < 1) return '< 1 min';
  if (minutes === 1) return '1 min';
  return `${minutes} mins`;
};
