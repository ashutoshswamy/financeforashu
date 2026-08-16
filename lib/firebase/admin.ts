import "server-only"

import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

function getAdminApp(): App {
  if (getApps().length) return getApps()[0]

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

let cachedAuth: ReturnType<typeof getAuth> | null = null

// Lazy so a missing/placeholder service account doesn't crash module load (e.g. during build).
export function getAdminAuth() {
  if (!cachedAuth) cachedAuth = getAuth(getAdminApp())
  return cachedAuth
}
