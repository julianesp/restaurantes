#!/bin/bash

# Script para deployment a producción
# Sistema de estadísticas y publicación automática

echo "🚀 Deployment a Producción - Sistema de Estadísticas"
echo "===================================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en la rama correcta
BRANCH=$(git branch --show-current)
echo "📍 Rama actual: $BRANCH"

if [ "$BRANCH" != "main" ]; then
  echo -e "${YELLOW}⚠️  No estás en la rama 'main'. ¿Continuar? (y/n)${NC}"
  read -r response
  if [ "$response" != "y" ]; then
    echo "❌ Deployment cancelado"
    exit 1
  fi
fi

echo ""
echo "📋 Checklist Pre-Deployment"
echo "----------------------------"

# Verificar archivos importantes
FILES=(
  "vercel.json"
  "proxy.ts"
  "app/api/cron/publish-weekly-winner/route.ts"
  "app/api/statistics/route.ts"
  "app/api/weekly-dishes/route.ts"
  "components/PlatDeLaSemaine.tsx"
  "app/admin/estadisticas/page.tsx"
)

echo "Verificando archivos..."
ALL_FILES_EXIST=true
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "  ${GREEN}✓${NC} $file"
  else
    echo -e "  ${RED}✗${NC} $file (FALTA)"
    ALL_FILES_EXIST=false
  fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
  echo -e "${RED}❌ Faltan archivos importantes. Verifica antes de continuar.${NC}"
  exit 1
fi

echo ""

# Verificar .env.local
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✓${NC} .env.local existe"

  # Verificar variables importantes
  if grep -q "CRON_SECRET" .env.local; then
    echo -e "${GREEN}✓${NC} CRON_SECRET configurado"
  else
    echo -e "${YELLOW}⚠️  CRON_SECRET no encontrado en .env.local${NC}"
  fi

  if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
    echo -e "${GREEN}✓${NC} SUPABASE_SERVICE_ROLE_KEY configurado"
  else
    echo -e "${RED}✗${NC} SUPABASE_SERVICE_ROLE_KEY no encontrado"
  fi
else
  echo -e "${YELLOW}⚠️  .env.local no existe${NC}"
fi

echo ""

# Verificar .gitignore
if grep -q ".env.local" .gitignore 2>/dev/null; then
  echo -e "${GREEN}✓${NC} .env.local está en .gitignore"
else
  echo -e "${YELLOW}⚠️  .env.local NO está en .gitignore. Agregando...${NC}"
  echo ".env.local" >> .gitignore
fi

echo ""
echo "📦 Preparando commit..."
echo "----------------------------"

# Mostrar archivos modificados
echo "Archivos modificados:"
git status --short

echo ""
echo -e "${YELLOW}¿Continuar con el commit y push? (y/n)${NC}"
read -r response

if [ "$response" != "y" ]; then
  echo "❌ Deployment cancelado"
  exit 1
fi

# Commit y push
echo ""
echo "📝 Creando commit..."
git add .
git commit -m "Deploy: Sistema de estadísticas y auto-publicación de plato de la semana

- Sistema de estadísticas con filtros (hoy, semana, mes, histórico)
- Componente 'Plat de la Semaine' con diseño francés elegante
- API endpoints para estadísticas y gestión de platos destacados
- Auto-publicación automática cada lunes vía Vercel Cron
- Sistema de badges para platos repetidos (2x, 3x, 5x)
- Panel de admin con botón de publicación manual
- Middleware configurado para rutas públicas
- Documentación completa incluida"

echo ""
echo "📤 Pushing a GitHub..."
git push origin $BRANCH

echo ""
echo -e "${GREEN}✅ Push exitoso!${NC}"
echo ""
echo "🎯 Próximos pasos:"
echo "----------------------------"
echo "1. Ve a Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Verifica que el deployment se completó (status: Ready)"
echo "3. Configura variables de entorno en Vercel:"
echo "   - CRON_SECRET (usa uno DIFERENTE para producción)"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo "4. Ejecuta los scripts SQL en Supabase de producción:"
echo "   - supabase-statistics-schema.sql (o supabase-fix-statistics.sql)"
echo "   - supabase-fix-sales-summary.sql"
echo "   - supabase-weekly-dishes-schema.sql"
echo ""
echo "5. Verifica el cron job en Vercel → Cron Jobs"
echo ""
echo "6. Prueba manualmente:"
echo "   curl https://TU_DOMINIO.vercel.app/api/cron/publish-weekly-winner \\"
echo "     -H 'Authorization: Bearer TU_CRON_SECRET'"
echo ""
echo "7. Consulta el checklist completo en:"
echo "   DEPLOYMENT_CHECKLIST.md"
echo ""
echo -e "${GREEN}🎉 ¡Deployment iniciado exitosamente!${NC}"
