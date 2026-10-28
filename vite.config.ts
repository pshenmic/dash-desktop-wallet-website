import { defineConfig } from 'vite'

// Relative base so the build works both on a custom domain and under
// https://<user>.github.io/<repo>/
export default defineConfig({
  base: './'
})
