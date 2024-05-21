import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('C:/Windows/system32/localhost-key.pem'),
      cert: fs.readFileSync('C:/Windows/system32/localhost.pem')
    }
  }
})
