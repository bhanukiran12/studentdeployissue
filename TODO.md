# Vercel Deployment for Telemedicine-Client

## Steps:

- [x] 1. Update package.json: Change engines to \"^18.17 || ^20 || ^22\"
- [x] 2. Create vercel.json with rewrites and build config
- [x] 3. Test build: `cd Telemedicine-Client && npm ci && npm run build` (✓ success, dist/ created)
- [ ] 4. User: git add . && git commit -m \"Prepare for Vercel deploy\" && git push
- [ ] 5. User: Add env var VITE_API_URL=your-backend-url in Vercel dashboard
- [ ] 6. Redeploy on Vercel (auto or manual)

**Note:** Backend must be running/deployed separately (e.g. Render with https://telemedicine-server-km4z.onrender.com).
