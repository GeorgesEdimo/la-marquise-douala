import type { DrinkSection } from '@/types/menu'

// La Marquise — Carte des boissons réelle
export const drinkSections: DrinkSection[] = [
  {
    id: 'milk-shake',
    title: 'Milk Shake',
    items: [
      { name: 'Chocolat', detail: 'Sauce Chocolat, Lait, Glace, Riz Croustillant, Sirop Chocolat, Pépites Chocolat Noir', price: 3000 },
      { name: 'Strawberry', detail: 'Sauce Chocolat, Lait, Glace, Riz Croustillant, Sirop Fraise, Pépites Chocolat Blanc', price: 3000 },
      { name: 'Caramel', detail: 'Sauce Caramel, Lait, Glace, Riz Croustillant, Sirop Chocolat, Pépites Chocolat Blanc', price: 3000 },
      { name: 'Oreo', detail: 'Sauce Spéciale, Lait, Glace, Biscuit Oreo, Riz Croustillant, Pépites Chocolat Noir', price: 3500 },
      { name: 'Lotus', detail: 'Sauce Spéciale, Lait, Glace, Biscuit Lotus, Riz Croustillant, Sirop Chocolat Noir', price: 3500 },
      { name: 'Coffee', detail: 'Sauce Café, Lait, Glace, Riz Croustillant, Sirop Chocolat, Pépites Chocolat Noir', price: 3500 },
      { name: 'Rose Berry', detail: 'Sauce Myrtille, Lait, Glace, Riz Croustillant, Sirop Chocolat Blanc', price: 3000 },
      { name: 'Blue Berry', detail: 'Sauce Myrtille, Lait, Glace, Riz Croustillant, Sirop Chocolat Blanc', price: 3000 },
      { name: 'Biscotto', detail: 'Sauce Café Biscuito, Lait, Glace, Riz Croustillant, Sirop Chocolat, Pépites Chocolat Noir', price: 3500 },
    ],
  },
  {
    id: 'fresh-juice',
    title: 'Fresh Juice',
    subtitle: 'Selon disponibilité',
    items: [
      { name: 'Carrot Juice', detail: '', price: 2000, glassPrice: 2500 },
      { name: 'Orange Juice', detail: '', price: 2500, glassPrice: 3000 },
      { name: 'Pineapple Juice', detail: '', price: 2000, glassPrice: 2500 },
      { name: 'Apple Juice', detail: '', price: 3000, glassPrice: 3500 },
      { name: 'Watermelon', detail: '', price: 2000, glassPrice: 2500 },
      { name: 'Frost', detail: 'Orange, Mandarine, Limonade', price: 1500, glassPrice: 2000 },
    ],
  },
  {
    id: 'smoothies',
    title: 'Special Smoothies',
    items: [
      { name: 'Smoothie Tropical', detail: 'Mangue, Ananas, Banane, Jus de fruits', price: 3500 },
      { name: 'Smoothie Berry', detail: 'Framboise, Myrtille, Banane, Yaourt', price: 3500 },
      { name: 'Smoothie Green', detail: 'Épinard, Pomme, Banane, Gingembre', price: 3500 },
    ],
  },
  {
    id: 'soda-juice',
    title: 'Soda & Juice',
    items: [
      { name: 'World Cola', price: 1000 },
      { name: 'Orangina', price: 1000 },
      { name: 'Vimoito', price: 1500 },
      { name: 'Dijino', price: 1000 },
      { name: 'Youzou', price: 1000 },
      { name: 'American Cola Zero', price: 1000 },
      { name: 'Jus Planet', price: 1000 },
      { name: 'Caprioska', price: 500 },
      { name: 'Tangu Petite', price: 500 },
      { name: 'Superment Petite', price: 500 },
    ],
  },
  {
    id: 'coffee-tea',
    title: 'Coffee & Tea',
    items: [
      { name: 'Barista Coffee', price: 1000 },
      { name: 'Cappuccino', price: 2000 },
      { name: 'Café Latte', price: 2000 },
      { name: 'Machiato Latte', price: 2000 },
      { name: 'Chococino', price: 2000 },
      { name: 'Tea', price: 1000 },
    ],
  },
  {
    id: 'cocktails-signature',
    title: 'Cocktails & Boissons',
    subtitle: 'Cocktails artisanaux & boissons fraîches',
    items: [
      { name: 'Cocktail Strawberry Sans Alcool', detail: 'Fraise fraîche, citron, sirop, eau gazeuse', price: 5000 },
      { name: 'Special Smoothies', detail: 'Fruits de saison, lait d\'amande, miel, glace', price: 5500 },
      { name: 'Jus d\'Ananas Frais', detail: '', price: 3000 },
    ],
  },
  {
    id: 'bieres',
    title: 'Bières',
    items: [
      { name: 'Castel, Beaufort, 33 Export, Isenbeck', price: 5000 },
      { name: 'Guinness, Smirnoff Ice', price: 5000 },
      { name: 'Heineken', price: 5000 },
    ],
  },
]
