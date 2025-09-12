

const TopBar = () => {
  return (
    <div className="bg-gray-900 text-white text-sm flex justify-end px-6 py-2 space-x-6">
      <a href="/sell">Sell</a>
      <a href="/help">Help</a>
      <a href="/affiliate">Affiliate</a>
      <select className="bg-gray-900 text-white">
        <option>USD</option>
        <option>EUR</option>
      </select>
      <select className="bg-gray-900 text-white">
        <option>EN</option>
        <option>VN</option>
      </select>
      <a href="/login">Login</a>
      <a href="/register">Register</a>
    </div>
  );
};

export default TopBar;