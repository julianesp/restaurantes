#!/bin/bash

# Script para encontrar todos los usos de "any" en el proyecto
# Uso: npm run find-any

echo "🔍 Buscando usos de 'any' en el proyecto..."
echo ""

# Buscar "any" en archivos TypeScript y React
grep -rn ": any" app/ components/ lib/ utils/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".next" > /tmp/any-results.txt

if [ -s /tmp/any-results.txt ]; then
  echo "❌ Se encontraron $(wc -l < /tmp/any-results.txt) usos de 'any':"
  echo ""
  cat /tmp/any-results.txt
  echo ""
  echo "💡 Recomendación: Reemplaza 'any' con tipos específicos o 'unknown'"
  exit 1
else
  echo "✅ No se encontraron usos de 'any' en el código"
  exit 0
fi
