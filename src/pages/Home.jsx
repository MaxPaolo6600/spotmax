import Header from "../components/Header"
import { supabase } from "../supabaseClient";
import procurar from "../assets/procurar.png";
import person from "../assets/do-utilizador (1).png";

export default function App() {
    return (
        <div>
            <Header />
            <main className="pt-16 p-6 bg-[#262B2D] min-h-screen">
                <div className="flex justify-between">
                    <div className="relative w-full max-w-md mt-4">
                        <img
                            src={procurar}
                            alt="Pesquisar"
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-70"
                        />
                        <input
                            type="search"
                            placeholder="Pesquisar..."
                            className="w-full pl-10 pr-4 py-2 border-2 border-[#274E5D] bg-[#212121] text-white rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#274E5D]"
                        />
                    </div>
                    <div className="relative w-full max-w-md mt-4">
                        <div className="w-full py-2 bg-[#212121] text-white rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#274E5D]">
                            <img
                                src={person}
                                alt="person"
                                className="h-5 w-5"
                            />
                        </div>
                    </div>
                </div>
                <h1 className="text-center mt-10 text-4xl text-white px-4 py-2">
                    Músicas
                </h1>
            </main>
        </div>
    );
}
