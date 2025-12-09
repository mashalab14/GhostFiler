const LicenseService = {
  isValid: function(key) {
    if (!key) return false;
    return (key.length > 8); 
  }
};
