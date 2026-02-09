# Test de creación de cliente con todos los campos
$body = @{
  first_name="Juan"
  last_name="Pérez Test"
  email="juan.test@example.com"
  phone="+593 999 123 456"
  document_number="1234567890"
  contract_number="KMPRY UIO 0005"
  total_nights=14
  remaining_nights=14
  'años'=3
  international_bonus="Si"
  total_amount=3500.00
  payment_status="sin_pago"
  ciudad="Quito"
  pais="Ecuador"
  linner="María González"
  closer="Carlos López"
} | ConvertTo-Json

Write-Host "Enviando petición al servidor..." -ForegroundColor Yellow
Write-Host "Body:" -ForegroundColor Cyan
Write-Host $body

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/clientes" -Method POST -Body $body -ContentType "application/json"
    Write-Host "`n✅ Cliente creado exitosamente!" -ForegroundColor Green
    Write-Host "`nRespuesta del servidor:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`n❌ Error al crear cliente:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host "`nDetalles del error:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message
    }
}
