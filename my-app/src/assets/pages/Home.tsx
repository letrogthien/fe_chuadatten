import NavigationTest from "../../components/NavigationTest/NavigationTest";
import MainBaner from "../banner/MainBaner";

type GameItem = {
    name: string;
    count: number;
};

type GameCategory = {
    title: string;
    color: string; // màu nền chính của card
    icon: string; // url icon hoặc emoji
    items: GameItem[];
};

const categories: GameCategory[] = [
    {
        title: "CURRENCY",
        color: "bg-orange-500",
        icon: "🪙",
        items: [
            { name: "World of Warcraft: The War Within", count: 13531 },
            { name: "WoW Cataclysm Classic", count: 961 },
            { name: "WoW Classic Era", count: 399 },
            { name: "Steam", count: 116 },
        ],
    },
    {
        title: "ITEMS",
        color: "bg-purple-600",
        icon: "🧿",
        items: [
            { name: "Diablo IV", count: 1288 },
            { name: "Fortnite", count: 1174 },
            { name: "League of Legends (PC)", count: 282 },
            { name: "Call of Duty: Black Ops 6", count: 190 },
        ],
    },
    {
        title: "ACCOUNTS",
        color: "bg-indigo-900",
        icon: "🌌",
        items: [
            { name: "Steam", count: 3074 },
            { name: "Fortnite", count: 2095 },
            { name: "League of Legends (PC)", count: 1769 },
            { name: "Genshin Impact", count: 893 },
        ],
    },
    {
        title: "GIFT CARDS",
        color: "bg-blue-600",
        icon: "🎁",
        items: [
            { name: "Hot Products", count: 597 },
            { name: "League of Legends (PC)", count: 173 },
            { name: "Steam", count: 98 },
            { name: "RBL", count: 30 },
        ],
    },
];

const Home: React.FC = () => {
    return (
        <>
            <MainBaner />
            <section className="py-12 bg-gray-50 flex-1">
                <h2 className="text-3xl font-bold text-center mb-10">Hot Game</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
                    {categories.map((cat, index) => (
                        <div
                            key={`${cat.title}-${index}`}
                            className={`relative rounded-xl shadow-lg p-6 text-white ${cat.color}`}
                        >
                            {/* Icon nổi bên trên */}
                            <div className="absolute -top-6 left-6 w-12 h-12 flex items-center justify-center rounded-lg shadow-md bg-white text-2xl">
                                {cat.icon}
                            </div>

                            {/* Tiêu đề */}
                            <h3 className="text-lg font-semibold mt-6 mb-4">{cat.title}</h3>

                            {/* Danh sách game */}
                            <ul className="space-y-3">
                                {cat.items.map((item) => (
                                    <li
                                        key={`${cat.title}-${item.name}`}
                                        className="flex justify-between border-b border-white/30 pb-1"
                                    >
                                        <span>{item.name}</span>
                                        <span className="bg-white/30 rounded-full px-2 text-sm">
                                            {item.count}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* Nút View More */}
                            <button className="mt-6 w-full bg-white/20 hover:bg-white/30 transition rounded-md py-2 font-medium">
                                View More
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default Home;