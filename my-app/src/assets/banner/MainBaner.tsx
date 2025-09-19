import BgBanner from "../img/minecraft-10th-3840x2160-23769.jpg";

const MainBanner = () => {
    return (
        <section
            className="w-full bg-cover bg-center h-64 md:h-96 relative flex flex-col items-center justify-center rounded-b-3xl overflow-hidden shadow-xl"
            style={{ backgroundImage: `url(${BgBanner})`}}
        >
            {/* Dòng chữ */}
            <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg mb-6">
                Chào mừng đến với Z2U.com
            </h1>

            {/* Nhiều nút
            <div className="flex gap-4 flex-wrap justify-center absolute bottom-8">
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 backdrop-filter backdrop-blur-sm border border-white/20 hover:bg-white/20 transition duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer min-w-[100px]">
                    <div className="text-2xl text-white mb-2">🎮</div>
                    <span className="text-white text-sm font-semibold text-center mt-2">
                        Game
                    </span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 backdrop-filter backdrop-blur-sm border border-white/20 hover:bg-white/20 transition duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer min-w-[100px]">
                    <div className="text-2xl text-white mb-2">💳</div>
                    <span className="text-white text-sm font-semibold text-center mt-2">
                        Nạp tiền
                    </span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 backdrop-filter backdrop-blur-sm border border-white/20 hover:bg-white/20 transition duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer min-w-[100px]">
                    <div className="text-2xl text-white mb-2">⭐</div>
                    <span className="text-white text-sm font-semibold text-center mt-2">
                        Ưu đãi
                    </span>
                </div>
            </div> */}
        </section>
    );
};


export default MainBanner;