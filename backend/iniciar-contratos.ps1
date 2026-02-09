# ========================================
# Script de Inicio Rápido - Sistema de Contratos
# ========================================

Write-Host "🚀 Iniciando Sistema de Contratos de Viaje..." -ForegroundColor Cyan
Write-Host ""

# 1. Ejecutar migraciones
Write-Host "📦 Paso 1: Ejecutando migraciones..." -ForegroundColor Yellow
node scripts/run-migrations.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al ejecutar migraciones" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Probar plantilla
Write-Host "🧪 Paso 2: Probando sistema de plantillas..." -ForegroundColor Yellow
node test-plantilla-contrato.js
Write-Host ""

# 3. Iniciar servidor
Write-Host "✅ Sistema listo! Iniciando servidor..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Endpoints disponibles:" -ForegroundColor Cyan
Write-Host "   GET    /api/contratos" -ForegroundColor White
Write-Host "   POST   /api/contratos/plantilla" -ForegroundColor White
Write-Host "   GET    /api/contratos/:id" -ForegroundColor White
Write-Host "   POST   /api/contratos/:id/firmar" -ForegroundColor White
Write-Host "   POST   /api/contratos/:id/activar" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Servidor en: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

npm run dev
