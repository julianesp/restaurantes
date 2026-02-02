/**
 * Script de migración para cargar los datos del menú actual a Supabase
 *
 * Para ejecutar:
 * 1. Asegúrate de tener las variables de entorno configuradas en .env.local
 * 2. Ejecuta: npx ts-node scripts/migrate-menu-data.ts
 *
 * O ejecuta desde el panel admin en /admin/menu usando un botón de migración
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Faltan las variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos del menú actual (copiados de app/menu/page.tsx)
const menuData = [
  {
    slug: "desayunos",
    name: "Desayunos",
    icon: "Coffee",
    color: "text-yellow-600",
    items: [
      {
        name: "Desayuno Tradicional",
        description: "Huevos al gusto, arepa, queso, chocolate y pan",
        price: "$12.000",
      },
      {
        name: "Calentado Campesino",
        description: "Arroz, frijoles, carne desmechada, huevo frito y arepa",
        price: "$15.000",
      },
      {
        name: "Changua",
        description:
          "Sopa de leche con huevo, cilantro y cebolla larga, acompañada de pan tostado",
        price: "$10.000",
      },
      {
        name: "Tamal con Chocolate",
        description:
          "Tamal tradicional envuelto en hoja de plátano, servido con chocolate caliente",
        price: "$14.000",
      },
      {
        name: "Huevos Pericos",
        description: "Huevos revueltos con tomate y cebolla, arepa y café",
        price: "$11.000",
      },
      {
        name: "Caldo de Costilla",
        description:
          "Caldo de costilla de res con papa criolla, cilantro y cebolla larga",
        price: "$16.000",
      },
    ],
  },
  {
    slug: "bebidas",
    name: "Bebidas",
    icon: "Coffee",
    color: "text-amber-600",
    items: [
      {
        name: "Café Americano",
        description: "Café recién molido con agua caliente",
        price: "$3.000",
      },
      {
        name: "Cappuccino",
        description: "Espresso con leche vaporizada y espuma",
        price: "$4.500",
      },
      {
        name: "Chocolate Caliente",
        description: "Chocolate artesanal con crema batida",
        price: "$4.000",
      },
      {
        name: "Jugo Natural",
        description: "Jugos de frutas frescas de temporada",
        price: "$5.000",
      },
      {
        name: "Limonada de Coco",
        description: "Refrescante limonada con toque de coco",
        price: "$6.000",
      },
    ],
  },
  {
    slug: "sopas",
    name: "Sopas",
    icon: "Soup",
    color: "text-orange-600",
    items: [
      {
        name: "Sopa de Pollo",
        description: "Sopa casera con pollo y verduras frescas",
        price: "$12.000",
      },
      {
        name: "Sancocho Campesino",
        description: "Tradicional sancocho con carne y plátano",
        price: "$15.000",
      },
      {
        name: "Ajiaco Bogotano",
        description: "Sopa de papa con pollo, alcaparras y crema",
        price: "$16.000",
      },
      {
        name: "Crema de Tomate",
        description: "Suave crema de tomate con albahaca",
        price: "$10.000",
        isVegetarian: true,
      },
    ],
  },
  {
    slug: "ensaladas",
    name: "Ensaladas",
    icon: "Salad",
    color: "text-green-600",
    items: [
      {
        name: "Ensalada César",
        description: "Lechuga romana, pollo, crutones y parmesano",
        price: "$14.000",
      },
      {
        name: "Ensalada Griega",
        description: "Tomate, pepino, cebolla, aceitunas y queso feta",
        price: "$13.000",
        isVegetarian: true,
      },
      {
        name: "Ensalada Caprese",
        description: "Tomate, mozzarella fresca y albahaca",
        price: "$12.000",
        isVegetarian: true,
      },
      {
        name: "Ensalada Tropical",
        description: "Mix de lechugas con frutas tropicales",
        price: "$15.000",
        isVegetarian: true,
      },
    ],
  },
  {
    slug: "platos-fuertes",
    name: "Platos Fuertes",
    icon: "UtensilsCrossed",
    color: "text-red-700",
    items: [
      {
        name: "Bandeja Paisa",
        description:
          "Frijoles, arroz, carne molida, chicharrón, chorizo, huevo, aguacate y arepa",
        price: "$28.000",
      },
      {
        name: "Pechuga a la Plancha",
        description: "Pechuga de pollo con arroz y ensalada",
        price: "$22.000",
      },
      {
        name: "Lomo de Cerdo",
        description: "Lomo de cerdo en salsa BBQ con papas",
        price: "$26.000",
      },
      {
        name: "Pescado Frito",
        description: "Mojarra frita con arroz de coco y patacón",
        price: "$30.000",
      },
      {
        name: "Cazuela de Mariscos",
        description: "Mariscos frescos en salsa criolla",
        price: "$35.000",
      },
      {
        name: "Churrasco",
        description: "Carne de res con chimichurri y papas",
        price: "$32.000",
      },
    ],
  },
  {
    slug: "postres",
    name: "Postres",
    icon: "Cake",
    color: "text-pink-600",
    items: [
      {
        name: "Tiramisú",
        description: "Clásico postre italiano con café y mascarpone",
        price: "$8.000",
      },
      {
        name: "Cheesecake",
        description: "Tarta de queso con frutos rojos",
        price: "$9.000",
      },
      {
        name: "Brownie con Helado",
        description: "Brownie de chocolate con helado de vainilla",
        price: "$10.000",
      },
      {
        name: "Tres Leches",
        description: "Tradicional pastel empapado en tres leches",
        price: "$7.500",
      },
    ],
  },
  {
    slug: "helados",
    name: "Helados",
    icon: "IceCream",
    color: "text-cyan-600",
    items: [
      {
        name: "Copa de Helado",
        description: "Tres bolas de helado con salsa a elección",
        price: "$8.000",
      },
      {
        name: "Sundae de Chocolate",
        description: "Helado con salsa de chocolate y crema",
        price: "$9.000",
      },
      {
        name: "Milkshake",
        description: "Batido cremoso en sabores variados",
        price: "$10.000",
      },
      {
        name: "Banana Split",
        description: "Plátano con helado, salsa y frutos secos",
        price: "$12.000",
      },
    ],
  },
  {
    slug: "cenas",
    name: "Cenas",
    icon: "UtensilsCrossed",
    color: "text-indigo-600",
    items: [
      {
        name: "Cena Ejecutiva",
        description: "Pechuga a la plancha, arroz, ensalada y jugo natural",
        price: "$20.000",
      },
      {
        name: "Cena Familiar",
        description:
          "Pollo asado, arroz, papas fritas, ensalada y gaseosa (4 personas)",
        price: "$65.000",
      },
      {
        name: "Hamburguesa Especial",
        description:
          "Carne de res, queso, tocineta, lechuga, tomate y papas fritas",
        price: "$18.000",
      },
      {
        name: "Sándwich Club",
        description:
          "Triple capa con pollo, tocineta, queso, lechuga, tomate y papas",
        price: "$16.000",
      },
      {
        name: "Wrap de Pollo",
        description:
          "Tortilla de trigo rellena de pollo, vegetales y salsa especial",
        price: "$15.000",
      },
      {
        name: "Sopa de la Noche",
        description: "Sopa del día con pan y mantequilla",
        price: "$12.000",
      },
    ],
  },
];

async function migrateData() {
  console.log('Iniciando migración de datos del menú...');

  try {
    // Insertar categorías y sus items
    for (let i = 0; i < menuData.length; i++) {
      const category = menuData[i];

      console.log(`\nProcesando categoría: ${category.name}`);

      // Insertar categoría
      const { data: categoryData, error: categoryError } = await supabase
        .from('menu_categories')
        .insert({
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          color: category.color,
          display_order: i,
          is_active: true,
        })
        .select()
        .single();

      if (categoryError) {
        console.error(`Error al insertar categoría ${category.name}:`, categoryError);
        continue;
      }

      console.log(`✓ Categoría creada: ${category.name}`);

      // Insertar items de la categoría
      for (let j = 0; j < category.items.length; j++) {
        const item = category.items[j];

        const { error: itemError } = await supabase
          .from('menu_items')
          .insert({
            category_id: categoryData.id,
            name: item.name,
            description: item.description,
            price: item.price,
            is_vegetarian: item.isVegetarian || false,
            is_spicy: false,
            is_available: true,
            display_order: j,
          });

        if (itemError) {
          console.error(`  Error al insertar item ${item.name}:`, itemError);
        } else {
          console.log(`  ✓ Item creado: ${item.name}`);
        }
      }
    }

    console.log('\n✅ Migración completada exitosamente!');
    console.log(`Total categorías: ${menuData.length}`);
    console.log(`Total items: ${menuData.reduce((sum, cat) => sum + cat.items.length, 0)}`);

  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateData();
