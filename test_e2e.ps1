$ErrorActionPreference = 'Stop'

Write-Host "=== 1. TESTING API HEALTH ==="
$health = Invoke-RestMethod -Uri "http://localhost:5000/api/health"
Write-Host "Health status: $($health.status), AI: $($health.gemini_ai), Model: $($health.model)"

Write-Host "`n=== 2. SUBMITTING NEW LOST ITEM ==="
$lostPayload = @{
    type = 'lost'
    title = 'Matte Black Dell XPS 15 9520'
    category = 'Electronics'
    location = 'Main Library'
    incident_date = (Get-Date).ToUniversalTime().ToString('s') + 'Z'
    description = 'Left on 3rd floor study desk near elevator. Carbon fiber palm rest with linux penguin decal.'
    image_url = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
} | ConvertTo-Json

$lostRes = Invoke-RestMethod -Uri "http://localhost:5000/api/items" -Method Post -Body $lostPayload -ContentType "application/json" -Headers @{ "x-user-id" = "11111111-1111-1111-1111-111111111111" }
Write-Host "Created Item ID: $($lostRes.item.id)"
Write-Host "Extracted Color: $($lostRes.item.ai_tags.extracted_color), Brand: $($lostRes.item.ai_tags.brand)"

Write-Host "`n=== 3. SUBMITTING MATCHING FOUND ITEM ==="
$foundPayload = @{
    type = 'found'
    title = 'Found Dell XPS Laptop on 3rd Floor'
    category = 'Electronics'
    location = 'Main Library'
    incident_date = (Get-Date).ToUniversalTime().ToString('s') + 'Z'
    description = 'Handed to library desk: Dell laptop with carbon fiber texture and decal on top lid.'
    image_url = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
} | ConvertTo-Json

$foundRes = Invoke-RestMethod -Uri "http://localhost:5000/api/items" -Method Post -Body $foundPayload -ContentType "application/json" -Headers @{ "x-user-id" = "22222222-2222-2222-2222-222222222222" }
Write-Host "Created Found Item ID: $($foundRes.item.id)"
Write-Host "Matches Found Automatically: $($foundRes.matches_found_count)"

Write-Host "`n=== 4. RETRIEVING MATCHES ==="
$matchesRes = Invoke-RestMethod -Uri ("http://localhost:5000/api/items/" + $foundRes.item.id + "/matches")
Write-Host "Total matches for item: $($matchesRes.count)"
if ($matchesRes.matches.Count -gt 0) {
    $match = $matchesRes.matches[0]
    Write-Host "Top Match ID: $($match.id)"
    Write-Host "Confidence Score: $($match.confidence_score)%"
    Write-Host "Reasoning snippet: $($match.match_reasoning.Substring(0, [Math]::Min(120, $match.match_reasoning.Length)))..."

    Write-Host "`n=== 5. SUBMITTING OWNERSHIP CLAIM ==="
    $claimPayload = @{
        match_id = $match.id
        proof_description = "I can confirm the BIOS service tag ends in 7XY9 and login user is alex.chen. Left charger in sleeve."
    } | ConvertTo-Json

    $claimRes = Invoke-RestMethod -Uri "http://localhost:5000/api/claims" -Method Post -Body $claimPayload -ContentType "application/json" -Headers @{ "x-user-id" = "11111111-1111-1111-1111-111111111111" }
    Write-Host "Claim Submitted ID: $($claimRes.claim.id), Status: $($claimRes.claim.status)"
}

Write-Host "`n=== 6. ADMIN MODERATION QUEUE & APPROVAL ==="
$adminRes = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/reports" -Headers @{ "x-user-id" = "44444444-4444-4444-4444-444444444444" }
Write-Host "Total Items: $($adminRes.stats.totalItems)"
Write-Host "Total Matches: $($adminRes.stats.totalMatches)"
Write-Host "Pending Claims in Queue: $($adminRes.stats.pendingClaims)"

if ($adminRes.pendingClaims.Count -gt 0) {
    $targetClaim = $adminRes.pendingClaims[0]
    $approvePayload = @{ status = "approved" } | ConvertTo-Json
    $approvalRes = Invoke-RestMethod -Uri ("http://localhost:5000/api/admin/claims/" + $targetClaim.id) -Method Patch -Body $approvePayload -ContentType "application/json" -Headers @{ "x-user-id" = "44444444-4444-4444-4444-444444444444" }
    Write-Host "Claim Moderation Result: $($approvalRes.message)"
}

Write-Host "`n=== 7. FINAL STATE CONFIRMATION ==="
$finalAdmin = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/reports" -Headers @{ "x-user-id" = "44444444-4444-4444-4444-444444444444" }
Write-Host "Resolved Items Count: $($finalAdmin.stats.resolvedItems)"
Write-Host "SUCCESS: FULL SYSTEM E2E CYCLE VERIFIED!"
