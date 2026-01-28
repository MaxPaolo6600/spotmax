import { useEffect, useState } from "react";
import Header from "../components/Header";
import { supabase } from "../supabaseClient";
import procurar from "../assets/procurar.png";
import person from "../assets/do-utilizador (1).png";

export default function App() {
    const [loading, setLoading] = useState(true);
    const [musicas, setMusicas] = useState([]);

    useEffect(() => {
        carregarPagina();
    }, []);

    async function carregarPagina() {
        try {
            const { data, error } = await supabase
                .from("musicas")
                .select(`
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
        <div className="bg-[#262B2D] min-h-screen">
            <Header />
            <main className="pt-16 p-6 bg-[#262B2D] min-h-screen text-white max-w-6xl mx-auto">
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
                    <div className="mt-4 p-2 bg-[#212121] rounded-full">
                        <img src={person} alt="Perfil" className="h-5 w-5" />
                    </div>
                </div>
                <h1 className="text-center mt-10 text-4xl px-4 py-2">
                    Músicas
                </h1>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {musicas.map((musica) => {
                        const album = musica.criacao?.albums?.[0];
                        return (
                            <div
                                key={musica.id}
                                className="bg-[#212121] rounded-xl overflow-hidden hover:bg-[#2a2a2a] transition"
                            >
                                <div className="aspect-square w-full bg-[#1a1a1a]">
                                    {musica.criacao?.image_url && (
                                        <img
                                            src={musica.criacao.image_url}
                                            alt={album?.nome_album}
                                            className="w-full h-full object-cover p-5 rounded-4xl"
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
            </main>
        </div>
    );
}
