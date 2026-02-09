# Script para actualizar el esquema de reservas
$dbUser = "postgres"
$dbPassword = "admin"
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "kempery"
$sqlFile = "update-reservas-schema.sql"

Write-Host "📋 Ejecutando script SQL para actualizar tabla reservas..."

# Configurar variable de entorno para password
$env:PGPASSWORD = $dbPassword

# Ejecutar el SQL
psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Esquema actualizado exitosamente"
} else {
    Write-Host "❌ Error al actualizar esquema (código: $LASTEXITCODE)"
}

# Limpiar variable de entorno
$env:PGPASSWORD = $null
