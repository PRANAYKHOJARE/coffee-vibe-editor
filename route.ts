/**
 * An array of routes that are accessible to public
 * These routes do not require authentication
 * @type {string[]}
 */

export const publicRoutes: string[] = [];

/**
 * An array of routes that are protected
 * Those routes require authentication
 * @type {string[]}
 */

export const protectedRoutes: string[] = ["/"];

/**
 * An array of routes that are accessible to the public
 * Routes that start with this (/api/auth) prefix do not require authentication
 * @type {string[]}
 */

export const authRoutes: string[] = [
  "/auth/sign-in", //Added leading slash
];

/**
 * An array of routes that are accessible to public
 * Routes that start with this (/api/auth) prefix do not require authentication
 * @type {string}
 */

export const apiAuthPrefix: string = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/"; //changed to redirect to home page after login
