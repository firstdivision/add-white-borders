import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const baseFromEnv = process.env.VITE_BASE

// https://vite.dev/config/
export default defineConfig({
  base: baseFromEnv ?? (repoName ? `/${repoName}/` : '/'),
  plugins: [react()],
})
