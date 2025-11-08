/**
 * Asgardeo Helper Utilities
 * Provides helper functions for Asgardeo authentication and registration
 */

export const ASGARDEO_CONFIG = {
  baseUrl: 'https://api.asgardeo.io/t/g11engineering',
  clientId: 'Y4Yrhdn2PcIxQRLfWYDdEycYTfUa',
  // Asgardeo doesn't have a direct self-registration URL
  // Users should use the login page which has a "Sign Up" option
  loginUrl: 'https://api.asgardeo.io/t/g11engineering/oauth2/authorize',
};

/**
 * Redirects user to Asgardeo's login page where they can find the "Sign Up" option
 * After successful registration and email verification, users should return to the platform and login via SSO
 */
export const redirectToAsgardeoSelfRegister = () => {
  if (typeof window === 'undefined') return;

  // Build authorization URL with parameters
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: ASGARDEO_CONFIG.clientId,
    redirect_uri: window.location.origin,
    scope: 'openid profile email groups',
    // prompt=login ensures user sees the login page with sign up option
    prompt: 'login',
  });

  // Redirect to Asgardeo login page
  // Users can click "Sign Up" link on the login page
  window.location.href = `${ASGARDEO_CONFIG.loginUrl}?${params.toString()}`;
};

/**
 * Gets the Asgardeo login URL (which includes sign up option)
 * Useful for displaying in instructions or links
 */
export const getAsgardeoLoginUrl = (): string => {
  return ASGARDEO_CONFIG.loginUrl;
};

/**
 * Checks if the current environment supports Asgardeo SSO
 */
export const isAsgardeoAvailable = (): boolean => {
  return !!(ASGARDEO_CONFIG.baseUrl && ASGARDEO_CONFIG.clientId);
};
