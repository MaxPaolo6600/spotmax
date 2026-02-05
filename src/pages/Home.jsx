import { useEffect, useState } from "react";
import Header from "../components/Header";
import { supabase } from "../supabaseClient";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
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
            const { data, error } = await supabase
                .from("musicas")
                .select(`
        id,
        nome_musica,
        audio_url,
        criacao (
            id,
            tipo,
            genre,
            release_date,
            image_url,
            nome_artista,
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
                <div className="min-h-screen flex items-center justify-center"
                    style={{ backgroundColor: bgColor, color: textColor }}>
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
            <main className="pt-16 p-6 max-w-6xl mx-auto">
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
                <h1 className="text-center mt-10 text-4xl" style={{ color: textColor }}>Músicas</h1>
                <div className="relative mt-12">
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        onClick={() => {
                            document.getElementById("carousel").scrollLeft -= 300;
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 backdrop-blur-md p-3 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.6)]"
                    >
                        <img src={esquerda} alt="Esquerda" className="h-6 w-6" />
                    </motion.button>
                    <div
                        id="carousel"
                        className="flex gap-6 overflow-x-auto scroll-smooth px-12 scrollbar-hide snap-x snap-mandatory"
                    >
                        <AnimatePresence>
                            {musicas.map((musica, index) => {
                                const album = musica.criacao?.albums?.[0];
                                return (
                                    <motion.div
                                        key={musica.id}
                                        initial={{ opacity: 0, x: 40 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -40 }}
                                        transition={{
                                            delay: index * 0.05,
                                            duration: 0.4,
                                            ease: "easeOut"
                                        }}
                                        className="snap-start bg-[#212121] rounded-2xl overflow-hidden flex flex-col justify-between"
                                    >
                                        <div className="bg-[#1a1a1a] p-3 h-full flex">
                                            {musica.criacao?.image_url && (
                                                <motion.img
                                                    src={musica.criacao.image_url}
                                                    alt={album?.nome_album}
                                                    className="w-100 object-cover rounded-2xl flex align-center"
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h2 className="text-2xl font-semibold truncate">
                                                {musica.nome_musica}
                                            </h2>
                                            <p className="text-xs opacity-70 truncate">
                                                {album?.nome_album || ""}
                                            </p>
                                            <p className="text-sm opacity-50 mb-2">
                                                {musica.criacao?.nome_artista}
                                            </p>
                                            {musica.audio_url && (
                                                <audio
                                                    controls
                                                    className="w-full h-8"
                                                    src={musica.audio_url}
                                                >
                                                    Seu navegador não suporta áudio.
                                                </audio>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        onClick={() => {
                            document.getElementById("carousel").scrollLeft -= 300;
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 backdrop-blur-md p-3 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.6)]"
                    >
                        <img src={direita} alt="Direita" className="h-6 w-6" />
                    </motion.button>
                </div>
            </main>
        </div>
    );
}
