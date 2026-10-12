import { notFound } from "next/navigation";
import MenuClient from "./MenuClient";
import { getTenant } from "@/lib/tenant";
import { getFullMenu } from "@/lib/menu";
import Navbar from "../../components/Navbar/page";
import Footer from "../../containers/Footer/page";

// Marcar la página como dinámica
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Tipos de datos
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: MenuItem[];
}

// Lee el menú del restaurante de esta petición directamente de la base de datos
async function getMenuData(): Promise<MenuCategory[]> {
  const tenant = await getTenant();
  if (!tenant) notFound();

  // Solo el restaurante original conserva el menú de ejemplo como respaldo;
  // los demás restaurantes nunca deben mostrar platos de otro.
  const useFallback = tenant.plan === 'legacy';

  try {
    const data = await getFullMenu(tenant.id);
    if (data.length > 0) return data as MenuCategory[];
  } catch (error) {
    console.error('Error al cargar el menú:', error);
  }
  return useFallback ? getFallbackMenuData() : [];
}

// Datos de respaldo en caso de que la API falle o no haya datos
function getFallbackMenuData(): MenuCategory[] {
  return [
    {
      id: "desayunos",
      name: "Desayunos",
      icon: "Coffee",
      color: "text-yellow-600",
      items: [
        {
          id: "fallback-1",
          name: "Desayuno Tradicional",
          description: "Huevos al gusto, arepa, queso, chocolate y pan",
          price: "$12.000",
        },
        {
          id: "fallback-2",
          name: "Calentado Campesino",
          description: "Arroz, frijoles, carne desmechada, huevo frito y arepa",
          price: "$15.000",
        },
      ],
    },
    {
      id: "platos-fuertes",
      name: "Platos Fuertes",
      icon: "UtensilsCrossed",
      color: "text-red-700",
      items: [
        {
          id: "fallback-3",
          name: "Bandeja Paisa",
          description:
            "Frijoles, arroz, carne molida, chicharrón, chorizo, huevo, aguacate y arepa",
          price: "$28.000",
        },
      ],
    },
  ];
}

export default async function MenuPage() {
  const menuData = await getMenuData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950">
      <Navbar />
      <MenuClient initialMenuData={menuData} />
      <Footer />
    </div>
  );
}
