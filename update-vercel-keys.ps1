$env:R2_ACCESS_KEY_ID = "1aeb42f691e77ec687c06aab6f32c6d3"
$env:R2_SECRET_ACCESS_KEY = "04cd582ad3cce77e7975e719b8bccc2c61ef8e4b9578ced98e3d173f8ad675fe"

Write-Host "Updating Vercel environment variables..."

"1aeb42f691e77ec687c06aab6f32c6d3" | npx vercel env add R2_ACCESS_KEY_ID production
"04cd582ad3cce77e7975e719b8bccc2c61ef8e4b9578ced98e3d173f8ad675fe" | npx vercel env add R2_SECRET_ACCESS_KEY production

Write-Host "Done!"
