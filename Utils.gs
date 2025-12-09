const Utils = {
  ALLOWED_MIMES: [
    "application/pdf",
    "image/jpeg",
    "image/png", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv"
  ],

  isValidAttachment: function(att) {
    if (att.getSize() < 5120) return false; 
    return this.ALLOWED_MIMES.includes(att.getContentType());
  },

  isValidDate: function(dateStr) {
    // 1. Strict Regex (YYYY-MM-DD)
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    
    // 2. Value Check (Catches 2024-99-99)
    const [y, m, d] = dateStr.split('-').map(Number);
    // Month is 0-indexed in JS Date
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    
    return (
      dateObj.getUTCFullYear() === y &&
      dateObj.getUTCMonth() === m - 1 &&
      dateObj.getUTCDate() === d
    );
  },

  sanitizePath: function(str) {
    if (!str) return "Unknown";
    return str.replace(/[\\/:*?"<>|]/g, "_").trim().substring(0, 50);
  }
};
