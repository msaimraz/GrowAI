$outputDir = "C:\Users\msraz\.gemini\antigravity-ide\brain\9abd8796-fd39-4e39-9471-144ae8c5fbe6\visual_qa"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$tests = @(
    @{ name = "desktop-1440-dashboard.png"; size = "1440,900"; url = "http://localhost:3000/app" },
    @{ name = "desktop-1440-planner.png"; size = "1440,900"; url = "http://localhost:3000/app/planner" },
    @{ name = "desktop-1440-mygarden.png"; size = "1440,900"; url = "http://localhost:3000/app/my-garden" },
    @{ name = "desktop-1440-broccoli.png"; size = "1440,900"; url = "http://localhost:3000/app/plants/broccoli-sprouts" },
    @{ name = "desktop-1152-planner.png"; size = "1152,900"; url = "http://localhost:3000/app/planner" },
    @{ name = "desktop-1152-mygarden.png"; size = "1152,900"; url = "http://localhost:3000/app/my-garden" },
    @{ name = "tablet-768-planner.png"; size = "768,1024"; url = "http://localhost:3000/app/planner" },
    @{ name = "tablet-768-broccoli.png"; size = "768,1024"; url = "http://localhost:3000/app/plants/broccoli-sprouts" },
    @{ name = "tablet-768-learn.png"; size = "768,1024"; url = "http://localhost:3000/app/learn" },
    @{ name = "mobile-390-learn.png"; size = "390,844"; url = "http://localhost:3000/app/learn" },
    @{ name = "mobile-390-broccoli.png"; size = "390,844"; url = "http://localhost:3000/app/plants/broccoli-sprouts" },
    @{ name = "mobile-390-planner.png"; size = "390,844"; url = "http://localhost:3000/app/planner" },
    @{ name = "mobile-390-mygarden.png"; size = "390,844"; url = "http://localhost:3000/app/my-garden" }
)

foreach ($t in $tests) {
    $outPath = Join-Path $outputDir $t.name
    Write-Host "Capturing $($t.name) at $($t.size)..."
    npx --yes playwright screenshot --channel=chrome --viewport-size=$($t.size) --wait-for-timeout=2500 $($t.url) $outPath
}
Write-Host "All screenshots captured successfully!"
