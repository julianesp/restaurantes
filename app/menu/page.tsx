import MenuClient from "./MenuClient";
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

// Función para obtener el menú desde la API
async function getMenuData(): Promise<MenuCategory[]> {
  // En el servidor, durante el build, devolver datos de respaldo
  if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_BASE_URL) {
    return getFallbackMenuData();
  }

  try {
    // En producción, usar la URL completa del sitio
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/menu/full`, {
      cache: 'no-store', // Siempre obtener datos frescos
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error('Error al obtener menú de la API');
      return getFallbackMenuData();
    }

    const data = await response.json();
    return data.length > 0 ? data : getFallbackMenuData();
  } catch (error) {
    console.error('Error al cargar el menú:', error);
    return getFallbackMenuData();
  }
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
