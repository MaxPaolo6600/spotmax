import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import MusicPlayer from "../components/MusicPlayer";
import { motion, AnimatePresence } from "framer-motion";
import AngleDown from "../assets/angle-small-down.png";

export default function MinhasObras() {
    const { bgColor, textColor } = useTheme();
    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [editingObra, setEditingObra] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        genre: ""
    });
    const [tracks, setTracks] = useState([]);
    const [genreOpen, setGenreOpen] = useState(false);
    const [genreSearch, setGenreSearch] = useState("");
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const releaseConfig = {
        album: {
            label: "Álbum",
            namePlaceholder: "Nome do álbum"
        },
        musica: {
            label: "Single",
            namePlaceholder: "Nome da música"
        }
    };

    const genres = [
        "Pop",
        "Rock",
        "Hip Hop",
        "Trap",
        "Funk",
        "Eletrônica",
        "Jazz",
        "Clássica"
    ];

    const filteredGenres = genres.filter(g =>
        g.toLowerCase().includes(genreSearch.toLowerCase())
    );

    useEffect(() => {
        fetchObras();
    }, []);

    function playMusic(musica, obra) {
        setCurrentTrack({
            nome_musica: musica.nome_musica,
            audio_url: musica.audio_url,
            cover: obra.image_url,
            nome_artista: obra.nome_artista,
            nome_album: obra.albums?.[0]?.nome_album || null
        });
    }

    async function fetchObras() {
        try {
            const {
                data: { user }
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
                        id,
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
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function openEditModal(obra) {
        setEditingObra(obra);
        setFormData({
            name:
                obra.albums?.[0]?.nome_album ||
                obra.musicas?.[0]?.nome_musica ||
                "",
            genre: obra.genre || ""
        });

        setTracks(
            obra.musicas?.map(m => ({
                id: m.id,
                name: m.nome_musica,
                file: null,
                audio_url: m.audio_url
            })) || []
        );
        setEditOpen(true);
    }
    function showToast(message, type = "success") {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3500);
    }
    function handleTrackNameChange(index, value) {
        const updated = [...tracks];
        updated[index].name = value;
        setTracks(updated);
    }

    function handleTrackFileChange(index, file) {
        const updated = [...tracks];
        updated[index].file = file;
        setTracks(updated);
    }

    function addTrack() {

        setTracks(prev => [
            ...prev,
            {
                id: null,
                name: "",
                file: null,
                audio_url: null
            }
        ]);
    }

    async function removeTrack(index) {
        const track = tracks[index];
        if (track.id) {
            if (track.audio_url) {
                const path = track.audio_url.split("/musicas/")[1];
                await supabase
                    .storage
                    .from("musicas")
                    .remove([path]);
            }
            await supabase
                .from("musicas")
                .delete()
                .eq("id", track.id);
        }
        showToast("Laixa deletada.");
        setTracks(prev => prev.filter((_, i) => i !== index));
    }

    async function updateObra() {
        const {
            data: { user }
        } = await supabase.auth.getUser();
        if (!user) return;

        try {
            if (!editingObra) return;
            await supabase
                .from("criacao")
                .update({
                    genre: formData.genre
                })
                .eq("id", editingObra.id);
            if (editingObra.albums?.length > 0) {
                await supabase
                    .from("albums")
                    .update({
                        nome_album: formData.name
                    })
                    .eq("criacao_id", editingObra.id);
            }

            for (const track of tracks) {
                let audioUrl = track.audio_url;

                if (track.file) {
                    if (track.audio_url) {
                        const oldPath = track.audio_url.split("/musicas/")[1];
                        await supabase.storage
                            .from("musicas")
                            .remove([oldPath]);
                    }
                    const fileName = `${user.id}/${crypto.randomUUID()}.mp3`;
                    const { error: uploadError } = await supabase.storage
                        .from("musicas")
                        .upload(fileName, track.file);
                    if (uploadError) throw uploadError;
                    const { data } = supabase
                        .storage
                        .from("musicas")
                        .getPublicUrl(fileName);
                    audioUrl = data.publicUrl;
                }

                if (track.id) {
                    await supabase
                        .from("musicas")
                        .update({
                            nome_musica: track.name,
                            audio_url: audioUrl
                        })
                        .eq("id", track.id);
                } else {
                    await supabase
                        .from("musicas")
                        .insert({
                            criacao_id: editingObra.id,
                            nome_musica: track.name,
                            audio_url: audioUrl
                        });
                }
            }

            setEditOpen(false);
            fetchObras();
        } catch (err) {
            console.error(err);
            showToast(error.message, err, "Erro ao atualizar");
        }
    }

    async function deleteObra(obraId) {
        const confirmDelete = confirm("Tem certeza que deseja deletar esta obra?");
        if (!confirmDelete) return;

        try {
            const { data: musicas } = await supabase
                .from("musicas")
                .select("audio_url")
                .eq("criacao_id", obraId);

            if (musicas?.length) {
                const paths = musicas.map(m =>
                    m.audio_url.split("/musicas/")[1]
                );
                await supabase.storage
                    .from("musicas")
                    .remove(paths);
            }

            const { data: criacao } = await supabase
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

            await supabase.from("musicas").delete().eq("criacao_id", obraId);
            await supabase.from("albums").delete().eq("criacao_id", obraId);
            await supabase.from("criacao").delete().eq("id", obraId);
            setObras(prev =>
                prev.filter(o => o.id !== obraId)
            );

        } catch (err) {
            console.error(err);
        }
    }

    if (loading) {
        return (
            <div>
                <Header />
                <div
                    className="min-h-screen flex items-center justify-center"
                    style={{
                        backgroundColor: bgColor,
                        color: textColor
                    }}
                >
                    Carregando...
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundColor: bgColor,
                color: textColor
            }}
        >
            <Header />
            <main className="pt-16 p-6 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 mt-8 text-center">
                    Minhas Obras
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {obras.map((obra) => {
                        const isAlbum =
                            obra.albums && obra.albums.length > 0;
                        const isSingle =
                            obra.tipo === "musica" &&
                            obra.musicas?.length === 1;
                        return (
                            <div
                                key={obra.id}
                                onClick={() => {
                                    if (obra.musicas?.length > 0
                                    ) {
                                        playMusic(obra.musicas[0], obra);
                                    }
                                }}
                                className="relative cursor-pointer bg-[#212121] rounded-xl p-4 hover:bg-[#212121]/50 transition"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(obra);
                                    }}
                                    className="absolute top-3 left-3 px-3 py-1 rounded-lg text-sm font-semibold bg-[#137FA8]"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteObra(obra.id);
                                    }}
                                    className="absolute top-3 right-3 px-3 py-1 rounded-lg text-sm font-semibold bg-[#5C0F0F]"
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
                                        : obra.musicas?.[0]?.nome_musica}
                                </h2>
                                {isAlbum && obra.musicas?.length > 0 && (
                                    <ol className="text-gray-400 text-sm mb-2 list-decimal list-inside">
                                        {obra.musicas.map((musica) => (
                                            <li
                                                key={musica.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    playMusic(musica, obra);
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
            </main>
            <AnimatePresence>
                {editOpen && editingObra && (
                    <motion.div
                        className="fixed inset-0 bg-[#212121]/50 backdrop-blur-xs flex items-center justify-center z-50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditOpen(false)}
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#262B2D] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#212121]"
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="px-6 py-4 border-b border-[#212121] flex justify-between items-center">
                                <h2 className="text-xl font-bold">
                                    Editar {releaseConfig[editingObra.tipo]?.label}
                                </h2>
                                <button
                                    onClick={() => setEditOpen(false)}
                                    className="text-[#137FA8] hover:text-white transition"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
                                <div>
                                    <label className="text-sm text-[#137FA8] block mb-2">
                                        {releaseConfig[editingObra.tipo]?.namePlaceholder}
                                    </label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        className="w-full bg-[#212121] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137FA8] transition"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="text-sm text-[#137FA8] block mb-2">
                                        Gênero
                                    </label>
                                    <div
                                        onClick={() => setGenreOpen(!genreOpen)}
                                        className="bg-[#212121] p-3 rounded-lg cursor-pointer flex justify-between items-center hover:ring-2 hover:ring-[#137FA8] transition"
                                    >
                                        {formData.genre || "Selecionar gênero"}
                                        <img
                                            src={AngleDown}
                                            className={`w-4 transition-transform ${genreOpen ? "rotate-180" : ""}`}
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {genreOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute w-full bg-[#212121] mt-2 rounded-lg shadow-xl border border-[#212121] z-10 max-h-48 overflow-y-auto"
                                            >
                                                {filteredGenres.map((g, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => {
                                                            setFormData({ ...formData, genre: g });
                                                            setGenreOpen(false);
                                                        }}
                                                        className="p-3 hover:bg-[#137FA8] transition cursor-pointer"
                                                    >
                                                        {g}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {tracks.length > 0 && (
                                    <div>
                                        <label className="text-sm text-[#137FA8] block mb-3">
                                            Faixas
                                        </label>
                                        <div className="space-y-3">
                                            {tracks.map((track, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center gap-3"
                                                >
                                                    <span className="text-[#137FA8] text-sm w-6">
                                                        {index + 1}
                                                    </span>
                                                    <input
                                                        value={track.name}
                                                        onChange={(e) =>
                                                            handleTrackNameChange(index, e.target.value)
                                                        }
                                                        className="flex-1 bg-[#212121] p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137FA8] transition"
                                                        placeholder="Nome da música"
                                                    />
                                                    <input
                                                        type="file"
                                                        accept="audio/mp3,audio/mpeg"
                                                        onChange={e => handleTrackFileChange(index, e.target.files[0])}
                                                        className="flex-1 bg-[#212121] text-[#5c5c5c] p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137FA8] transition"
                                                    />
                                                    {track.audio_url && !track.file && (
                                                        <span className="text-xs text-gray-500 mt-1">
                                                            {track.audio_url.split("/musicas/")[1]}
                                                        </span>
                                                    )}
                                                    {track.file && (
                                                        <span className="text-xs text-green-400 mt-1">
                                                            Novo arquivo: {track.file.name}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => removeTrack(index)}
                                                        className="text-red-500 hover:text-red-400 text-sm"
                                                    >
                                                        ✕
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={addTrack}
                                            className="mt-4 text-[#274E5D] font-bold hover:underline text-sm"
                                        >
                                            + Adicionar faixa
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="px-6 py-4 border-t border-[#212121] flex justify-end gap-3">
                                <button
                                    onClick={() => setEditOpen(false)}
                                    className="px-4 py-2 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={updateObra}
                                    className="px-5 py-2 rounded-lg bg-[#137FA8] hover:opacity-90 transition font-semibold"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ duration: 0.3 }}
                        className={`fixed bottom-6 right-6 z-50 max-w-sm px-6 py-4 rounded-xl shadow-2xl text-white
                ${toast.type === "success"
                                ? "bg-[#137FA8]"
                                : "bg-[#5C0F0F]"
                            }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <span className="font-semibold">{toast.message}</span>
                            <button
                                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                                className="text-white/80 hover:text-white text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <MusicPlayer
                track={currentTrack}
                onClose={() => setCurrentTrack(null)}
            />
        </div>
    );
}
