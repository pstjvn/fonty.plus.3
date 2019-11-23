/**
 * The type of sorting google fonts API supports.
 * @const {Array<string>}
 */
export const SortOptions = ['trending', 'popularity', 'date', 'alpha'];

/**
 * Getter for encoded URL to query for fonts list.
 * @param {string} key The API key to use.
 * @param {string} sortBy The sorting to use. If invalid is provided we will
 * use the first in the available sorting options.
 * @return {string} The encoded URL to fetch from.
 */
export const getUrl = function(key, sortBy) {
  if (!SortOptions.includes(sortBy)) { 
    sortBy = SortOptions[0];
  }
  const a = encodeURIComponent(key);
  const b = encodeURIComponent(sortBy);
  return `https://www.googleapis.com/webfonts/v1/webfonts?sort=${b}&key=${a}`;
}
