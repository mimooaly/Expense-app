export interface Category {
  id: number;
  name: string;
  icon: string;
}

const expensesCateg: Category[] = [
  { id: 1, name: "Shopping", icon: "shopping-bag" },
  { id: 2, name: "Entertainment", icon: "film" },
  { id: 3, name: "Transportation", icon: "map" },
  { id: 4, name: "Grocery", icon: "shopping-cart" },
  { id: 5, name: "Dining out", icon: "coffee" },
  { id: 6, name: "Housing", icon: "home" },
  { id: 7, name: "Subscriptions", icon: "trello" },
  { id: 8, name: "Family and Education", icon: "users" },
  { id: 9, name: "Investments", icon: "trending-up" },
  { id: 10, name: "Health and Insurance", icon: "activity" },
  { id: 11, name: "Pets", icon: "github" },
  { id: 12, name: "Miscellaneous", icon: "box" },
  { id: 13, name: "Bad Habits", icon: "frown" }
];

export default expensesCateg; 