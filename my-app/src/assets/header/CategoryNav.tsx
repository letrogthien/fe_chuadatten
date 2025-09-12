// CategoryNav.tsx
const categories = [
  "Currency",
  "Items",
  "Accounts",
  "Gift Cards",
  "Boosting",
  "Software",
];

const CategoryNav = () => {
  return (
    <nav className="bg-blue-600 text-white px-6 py-2">
      <ul className="flex space-x-6 text-sm">
        {categories.map((cat) => (
          <li key={cat} className="hover:underline cursor-pointer">
            {cat}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryNav;
