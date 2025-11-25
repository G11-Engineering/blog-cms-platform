export const asgardeoConfig = {
    signInRedirectURL: process.env.NEXT_PUBLIC_ASGARDEO_REDIRECT_URL || "http://localhost:3000",
    signOutRedirectURL: process.env.NEXT_PUBLIC_ASGARDEO_REDIRECT_URL || "http://localhost:3000",
    clientID: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID || "Y4Yrhdn2PcIxQRLfWYDdEycYTfUa",
    baseUrl: process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL || "https://api.asgardeo.io/t/g11engineering",
    scope: (process.env.NEXT_PUBLIC_ASGARDEO_SCOPE || "openid profile email groups").split(" ")
};