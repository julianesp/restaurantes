import { all } from "@/lib/db";

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  isVegetarian: boolean;
  isSpicy: boolean;
}

export interface PublicMenuCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: PublicMenuItem[];
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}
interface ItemRow {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  is_vegetarian: boolean;
  is_spicy: boolean;
}

/**
 * Menú público completo (categorías activas con sus platos disponibles) de un restaurante.
 * Lo usan la ruta /api/menu/full y la página /menu, para no hacer un fetch HTTP a sí mismas.
 */
export async function getFullMenu(restaurantId: string): Promise<PublicMenuCategory[]> {
  const [categories, items] = await Promise.all([
    all<CategoryRow>(
      "SELECT * FROM menu_categories WHERE restaurant_id = ? AND is_active = 1 ORDER BY display_order",
      restaurantId
    ),
    all<ItemRow>(
      "SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = 1 ORDER BY display_order",
      restaurantId
    ),
  ]);

  return categories.map((category) => ({
    id: category.slug,
    name: category.name,
    icon: category.icon,
    color: category.color,
    items: items
      .filter((item) => item.category_id === category.id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || null,
        isVegetarian: item.is_vegetarian,
        isSpicy: item.is_spicy,
      })),
  }));
}
