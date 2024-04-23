# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Setting up HTTPS for local development

1. Install mkcert
For Mac/Linux
  - `curl -L -o mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-darwin-amd64`
  - `chmod +x mkcert`
  - `sudo mv mkcert /usr/local/bin/`
  - `mkcert -install`
For Windows
  - `curl -L -o mkcert.exe https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-windows-amd64.exe`
  - copy mkcert.exe to a directory already included in PATH or add the directory containing mkcert to PATH
  - `mkcert`
2. Generate certificate for localhost
  - `mkcert localhost'
3. Use certificates in server
  - Navigate to vite.config.js
  - Paste following code:
```
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('path/localhost-key.pem'),
      cert: fs.readFileSync('path/localhost.pem')
    }
  }
})
```
* Where "path" is the absolute path to your certificates
4. Run the server with `npm run dev`
