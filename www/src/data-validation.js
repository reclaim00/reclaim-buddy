// Small, dependency-free migrations for data loaded from local storage or backups.
var ReclaimDataValidation = (function() {
  function validMoodNumber(mood) {
    if (typeof mood !== 'number' && typeof mood !== 'string') return null;
    if (typeof mood === 'string' && !mood.trim()) return null;
    var value = Number(mood);
    return Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;
  }

  function normalizeJournalEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries.reduce(function(result, entry) {
      if (typeof entry === 'string') {
        result.push({ text: entry, date: '' });
        return result;
      }
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return result;
      var normalized = Object.assign({}, entry);
      if (Object.prototype.hasOwnProperty.call(normalized, 'mood')) {
        var mood = validMoodNumber(normalized.mood);
        if (mood !== null) normalized.mood = mood;
        else delete normalized.mood;
      }
      result.push(normalized);
      return result;
    }, []);
  }

  function journalMoodLabel(mood, moods) {
    var value = validMoodNumber(mood);
    if (!Array.isArray(moods) || value === null || value > moods.length || !moods[value - 1]) return '';
    return ' &middot; ' + moods[value - 1].label;
  }

  return { normalizeJournalEntries: normalizeJournalEntries, journalMoodLabel: journalMoodLabel };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = ReclaimDataValidation;
