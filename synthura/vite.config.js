import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('/home/owenhustles/certs/localhost-key.pem'),
      cert: fs.readFileSync('/home/owenhustles/certs/localhost.pem')
    }
  }
})
