import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isProduction = process.env.NODE_ENV === 'production';

const cspDev = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseio.com https://www.googletagmanager.com https://va.vercel-scripts.com https://*.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com wss://*.firebasedatabase.app https://*.firebaseapp.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://open.er-api.com https://*.google-analytics.com https://www.google-analytics.com wss://s-usc1b-nss-2163.firebaseio.com wss://*.firebaseio.com wss://*.firebasedatabase.app; frame-src 'self' https://*.firebaseio.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; worker-src 'self'; manifest-src 'self';";

const cspProd = "default-src 'self'; script-src 'self' https://*.firebaseio.com https://www.googletagmanager.com https://va.vercel-scripts.com https://*.vercel-scripts.com; style-src 'self'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com wss://*.firebasedatabase.app https://*.firebaseapp.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://open.er-api.com https://*.google-analytics.com https://www.google-analytics.com wss://s-usc1b-nss-2163.firebaseio.com wss://*.firebaseio.com wss://*.firebasedatabase.app; frame-src 'self' https://*.firebaseio.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; worker-src 'self'; manifest-src 'self';";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Content-Security-Policy': isProduction ? cspProd : cspDev,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
  }
})
