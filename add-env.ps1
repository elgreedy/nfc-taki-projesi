$env:R2_ACCOUNT_ID = "fa058f2cf2db37c8e723cfbd6b38e9a1"
$env:R2_ACCESS_KEY_ID = "bfa128a6988941ae5453783100c209a"
$env:R2_SECRET_ACCESS_KEY = "615b6ca522f0fbdc8916710bc1e70b4e7eb7ea0f8db325c2982cd7fe1a3ecc"
$env:R2_BUCKET_NAME = "taki"
$env:R2_PUBLIC_URL = "https://pub-00a554d03b9a488f85b60d9528f47c1b.r2.dev"

Write-Host "Adding R2 environment variables to Vercel..."

"fa058f2cf2db37c8e723cfbd6b38e9a1" | npx vercel env add R2_ACCOUNT_ID production
"bfa128a6988941ae5453783100c209a" | npx vercel env add R2_ACCESS_KEY_ID production
"615b6ca522f0fbdc8916710bc1e70b4e7eb7ea0f8db325c2982cd7fe1a3ecc" | npx vercel env add R2_SECRET_ACCESS_KEY production
"taki" | npx vercel env add R2_BUCKET_NAME production
"https://pub-00a554d03b9a488f85b60d9528f47c1b.r2.dev" | npx vercel env add R2_PUBLIC_URL production

Write-Host "Done!"
