export interface Category {
  id: number;
  name: string;
  icon: string;
}

const expensesCateg: Category[] = [
  { id: 13, name: "Bad Habits", icon: "🫠" },
  { id: 5, name: "Dining out", icon: "🍔" },
  { id: 16, name: "Education", icon: "🎓" },
  { id: 2, name: "Entertainment", icon: "🎉" },
  { id: 8, name: "Family", icon: "🥰" },
  { id: 14, name: "Gifts", icon: "🎁" },
  { id: 4, name: "Grocery", icon: "🛒" },
  { id: 10, name: "Health and Fitness", icon: "🩺" },
  { id: 6, name: "Housing", icon: "🏠" },
  { id: 9, name: "Investments", icon: "🤑" },
  { id: 12, name: "Miscellaneous", icon: "🤷‍♂️" },
  { id: 11, name: "Pets", icon: "🐹" },
  { id: 1, name: "Shopping", icon: "🛍️" },
  { id: 7, name: "Subscriptions", icon: "📅" },
  { id: 3, name: "Transportation", icon: "🚗" },
  { id: 15, name: "Travel", icon: "✈️" },
];

export default expensesCateg; 