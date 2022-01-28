import removeConsole from 'vite-plugin-remove-console'
import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [glsl(), removeConsole()],
  server: {
    host: true,
  },
})
