// ==============================================================================
// CONFIGURATION TEMPLATE (config.example.js)
// Duplicate this file as 'config.js' to configure your private credentials locally.
// 'config.js' is excluded by .gitignore and will NEVER be pushed to GitHub.
// ==============================================================================

window.PORTFOLIO_CONFIG = {
  // Contact & Form Relay Endpoint
  CONTACT_EMAIL: "your-email@domain.com",
  FORMSUBMIT_ENDPOINT: "https://formsubmit.co/ajax/your-email@domain.com",

  // Communication Uplink Channels
  SIGNAL_HANDLE: "@your-signal-handle",

  // OpenPGP / Kleopatra Specification
  PGP_FINGERPRINT: "XXXX XXXX XXXX XXXX XXXX  XXXX XXXX XXXX XXXX XXXX",
  PGP_KEY_ID: "0xXXXXXXXX",

  // Developer Profile
  GITHUB_PROFILE: "https://github.com/your-username"
};
