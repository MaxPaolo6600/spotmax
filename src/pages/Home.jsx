import { useEffect, useState } from "react";
import Header from "../components/Header";
import { supabase } from "../supabaseClient";
import { useTheme } from "../context/ThemeContext";
import procurar from "../assets/procurar.png";
import person from "../assets/do-utilizador (1).png";
import direita from "../assets/angulo-direito.png";
import esquerda from "../assets/angulo-esquerdo.png";

export default function App() {
    const [loading, setLoading] = useState(true);
    const [musicas, setMusicas] = useState([]);
    const { bgColor, textColor } = useTheme();

    useEffect(() => {
        carregarPagina();
    }, []);

    async function carregarPagina() {
        try {
            const { data, error } = await supabase.from("musicas").select(`
                    id,
                    nome_musica,
                    criacao (
                        id,
                        tipo,
                        genre,
                        release_date,
                        image_url,
                        albums (
                            id,
                            nome_album
                        )
                    )
                `);
            if (error) throw error;
            setMusicas(data);
        } catch (error) {
            console.error("Erro ao carregar músicas:", error);
        } finally {
            setLoading(false);
        }
    }
    if (loading) {
        return (
            <div>
                <Header />
                <div className="min-h-screen bg-[#262B2D] text-white flex items-center justify-center">
                    Carregando...
                </div>
            </div>
        );
    }
    return (
        <div
            className="min-h-screen transition-colors duration-300"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            <Header />
            <main className="pt-16 p-6 text-white max-w-6xl mx-auto">
                <div className="flex justify-between items-center">
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
                    <div className="mt-4 p-2 bg-[#212121] rounded-full hover:bg-[#2a2a2a] transition">
                        <img src={person} alt="Perfil" className="h-5 w-5" />
                    </div>
                </div>
                <h1 className="text-center mt-10 text-4xl" style={{color: textColor}}>Músicas</h1>
                <div className="relative mt-12">
                    <div
                        className="pointer-events-none absolute left-0 top-0 h-full w-16 
                                    bg-gradient-to-r from-[#262B2D] to-transparent z-10"
                    />
                    <div
                        className="pointer-events-none absolute right-0 top-0 h-full w-16 
                                    bg-gradient-to-l from-[#262B2D] to-transparent z-10"
                    />
                    <button
                        onClick={() => {
                            document.getElementById("carousel").scrollLeft -= 300;
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-[#1f1f1f]/80 backdrop-blur-md hover:bg-[#2a2a2a] p-3 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.6)] hover:scale-110 transition-all duration-300"
                    >
                        <img src={esquerda} alt="Esquerda" className="h-6 w-6" />
                    </button>
                    <div
                        id="carousel"
                        className="flex gap-6 overflow-x-auto scroll-smooth px-12 scrollbar-hide snap-x snap-mandatory"
                    >
                        {musicas.map((musica) => {
                            const album = musica.criacao?.albums?.[0];
                            return (
                                <div
                                    key={musica.id}
                                    className="min-w-[180px] snap-start bg-[#212121] rounded-2xl overflow-hidden hover:bg-[#2f2f2f] hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="aspect-square w-full bg-[#1a1a1a]">
                                        {musica.criacao?.image_url && (
                                            <img
                                                src={musica.criacao.image_url}
                                                alt={album?.nome_album}
                                                className="w-full h-full object-cover p-4 rounded-2xl"
                                            />
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h2 className="text-sm font-semibold truncate">
                                            {musica.nome_musica}
                                        </h2>
                                        <p className="text-xs opacity-70 truncate">
                                            {album?.nome_album || "Sem álbum"}
                                        </p>
                                        <p className="text-xs opacity-50">
                                            {musica.criacao?.genre}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => {
                            document.getElementById("carousel").scrollLeft += 300;
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-[#1f1f1f]/80 backdrop-blur-md hover:bg-[#2a2a2a] p-3 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.6)] hover:scale-110 transition-all duration-300"
                    >
                        <img src={direita} alt="Direita" className="h-6 w-6" />
                    </button>
                </div>
            </main>
        </div>
    );
}
