// Mock for the "server-only" package.
// In Next.js this throws if imported on the client.
// In Jest (Node environment) we just export nothing — the guard is not needed.
export {};
