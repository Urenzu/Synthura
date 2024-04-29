# Setting up HTTPS for local development

1. Install mkcert  
- Follow ReadMe of this git repo: https://github.com/FiloSottile/mkcert
  
2. Generate certificate for localhost  
- `mkcert localhost`
  
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
*Where "path" is the absolute path to your certificates*

4. Run the server with `npm run dev`
