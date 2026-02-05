import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import MusicPlayer from "../components/MusicPlayer";

export default function MinhasObras() {
    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(true);
    const { bgColor, textColor } = useTheme();

    const [currentTrack, setCurrentTrack] = useState(null);

    useEffect(() => {
        fetchObras();
    }, []);

    function playMusic(musica, cover) {
        setCurrentTrack({
            title: musica.nome_musica,
            audioUrl: musica.audio_url,
            cover: cover,
        });
    }

    async function fetchObras() {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from("criacao")
                .select(`
        id,
        tipo,
        genre,
        release_date,
        image_url,
        nome_artista,
        albums (
            nome_album
        ),
        musicas (
            id,
            nome_musica,
            audio_url
        )
    `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            setObras(data);
        } catch (err) {
            console.error("Erro ao buscar obras:", err);
        } finally {
            setLoading(false);
        }
    }

    async function deleteObra(obraId) {
        const confirmDelete =
            confirm("Tem certeza que deseja deletar esta obra?");
        if (!confirmDelete) return;
        try {
            const { data: musicas, error: fetchError } =
                await supabase
                    .from("musicas")
                    .select("audio_url")
                    .eq("criacao_id", obraId);
            if (fetchError) throw fetchError;
            if (musicas?.length > 0) {
                const paths = musicas.map(m => {
                    const url = m.audio_url;
                    const path =
                        url.split("/musicas/")[1];
                    return path;
                });

                const { error: storageError } =
                    await supabase.storage
                        .from("musicas")
                        .remove(paths);
                if (storageError) throw storageError;
            }

            const { data: criacao } =
                await supabase
                    .from("criacao")
                    .select("image_url")
                    .eq("id", obraId)
                    .single();

            if (criacao?.image_url) {

                const imagePath =
                    criacao.image_url.split("/albums/")[1];
                await supabase.storage
                    .from("albums")
                    .remove([imagePath]);
            }
            await supabase
                .from("musicas")
                .delete()
                .eq("criacao_id", obraId);
            await supabase
                .from("albums")
                .delete()
                .eq("criacao_id", obraId);
            await supabase
                .from("criacao")
                .delete()
                .eq("id", obraId);
            setObras(prev =>
                prev.filter(o => o.id !== obraId)
            );
        }
        catch (err) {
            console.error(err);
            alert("Erro ao deletar obra");
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
                <h1 className="text-3xl font-bold mb-8 mt-8 text-center">
                    Minhas Obras
                </h1>
                {obras.length === 0 ? (
                    <p className="text-center text-gray-400">
                        Você ainda não criou nenhuma obra.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {obras.map((obra) => {
                            const isAlbum = obra.albums && obra.albums.length > 0;
                            const isSingle =
                                obra.tipo === "musica" &&
                                (!obra.albums || obra.albums.length === 0) &&
                                obra.musicas?.length === 1;
                            return (
                                <div
                                    key={obra.id}
                                    onClick={() => {
                                        if (obra.musicas?.length === 1) {
                                            playMusic(obra.musicas[0], obra.image_url);
                                        }
                                        if (obra.albums && obra.musicas?.length > 0) {
                                            playMusic(obra.musicas[0], obra.image_url);
                                        }
                                    }}
                                    className="relative cursor-pointer bg-[#212121] rounded-xl p-4 hover:bg-[#274E5D] transition"
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteObra(obra.id);
                                        }}
                                        className="absolute top-3 right-3 px-3 py-1 rounded-lg text-sm font-semibold transition"
                                        style={{ backgroundColor: "#5C0F0F" }}
                                    >
                                        Deletar
                                    </button>

                                    {obra.image_url && (
                                        <img
                                            src={obra.image_url}
                                            alt=""
                                            className="w-full h-48 object-cover rounded-lg mb-4"
                                        />
                                    )}
                                    <h2 className="text-xl font-semibold mb-2">
                                        {isAlbum
                                            ? obra.albums[0].nome_album
                                            : isSingle
                                                ? obra.musicas[0].nome_musica
                                                : obra.musicas[0].nome_musica}
                                    </h2>
                                    {isAlbum && obra.musicas?.length > 0 && (
                                        <ol className="text-gray-400 text-sm mb-2 list-decimal list-inside">
                                            {obra.musicas.map((musica) => (
                                                <li
                                                    key={musica.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        playMusic(musica, obra.image_url);
                                                    }}
                                                    className="cursor-pointer hover:text-white"
                                                >
                                                    {musica.nome_musica}
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                    <p className="text-sm text-gray-400 capitalize">
                                        {obra.tipo} • {obra.genre}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {obra.release_date}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            <MusicPlayer
                track={currentTrack}
                onClose={() => setCurrentTrack(null)}
            />
        </div>
    );
}
