#!/bin/bash

# Script para probar el endpoint de auto-publicación

echo "🧪 Probando endpoint de auto-publicación..."
echo ""

# Probar sin token (desarrollo)
echo "1️⃣ Probando sin token (modo desarrollo)..."
curl -X GET http://localhost:3000/api/cron/publish-weekly-winner \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq .

echo ""
echo "-----------------------------------"
echo ""

# Si tienes CRON_SECRET configurado, descomenta esto:
# echo "2️⃣ Probando con token..."
# curl -X GET http://localhost:3000/api/cron/publish-weekly-winner \
#   -H "Authorization: Bearer tu_cron_secret_aqui" \
#   -H "Content-Type: application/json" \
#   -w "\nHTTP Status: %{http_code}\n" \
#   -s | jq .

echo ""
echo "✅ Prueba completada"
echo ""
echo "Para ver el resultado en Supabase:"
echo "SELECT * FROM weekly_featured_dishes WHERE published_by = 'cron-auto' ORDER BY published_at DESC LIMIT 1;"
