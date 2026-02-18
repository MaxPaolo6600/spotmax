import { useState } from "react";
import Header from "../components/Header";
import Lupa from "../assets/procurar.png";
import AngleDown from "../assets/angle-small-down.png";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";

export default function Estudio() {
    const [selectedType, setSelectedType] = useState("Álbum");

    const [formData, setFormData] = useState({
        name: "",
        genre: "",
        releaseDate: "",
        image: null,
        imagePreview: null,
    });

    const [tracks, setTracks] = useState([
        { name: "", file: null }
    ]);

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const [isLoading, setIsLoading] = useState(false);

    const genres = [
        "Hip Hop",
        "Pop",
        "Rock",
        "Eletrônica",
        "Trap",
        "R&B",
        "Funk",
        "Jazz",
        "Blues",
        "Reggae",
        "Lo-fi",
        "House",
        "Techno",
        "Dubstep",
        "MPB",
        "Sertanejo",
        "Gospel",
        "Metal",
        "Indie",
        "Alternativo",
    ];
    const [genreOpen, setGenreOpen] = useState(false);
    const [genreSearch, setGenreSearch] = useState("");
    const filteredGenres = genres.filter(g =>
        g.toLowerCase().includes(genreSearch.toLowerCase())
    );

    const releaseConfig = {
        Álbum: { label: "álbum", namePlaceholder: "Nome do álbum" },
        Ep: { label: "EP", namePlaceholder: "Nome do EP" },
        "Música Single": { label: "single", namePlaceholder: "Nome da música" },
        Podcast: { label: "podcast", namePlaceholder: "Nome do podcast" },
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.15, duration: 0.5 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
    };

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        setFormData(prev => ({
            ...prev,
            image: file,
            imagePreview: URL.createObjectURL(file),
        }));
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
        setTracks(prev => [...prev, { name: "", file: null }]);
    }

    function removeTrack(index) {
        setTracks(prev => prev.filter((_, i) => i !== index));
    }

    async function uploadMusic(file, userId) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

        const { error } = await supabase.storage
            .from("musicas")
            .upload(fileName, file);

        if (error) throw error;

        const { data } = supabase.storage
            .from("musicas")
            .getPublicUrl(fileName);

        return data.publicUrl;
    }

    async function uploadImage(file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error } = await supabase.storage
            .from("albums")
            .upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage
            .from("albums")
            .getPublicUrl(fileName);
        return data.publicUrl;
    }

    function showToast(message, type = "success") {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3500);
    }
    async function handleSubmit() {
        setIsLoading(true);
        let criacaoId = null;
        let albumId = null;
        try {
            const {
                data: { user },
                error: userError
            } = await supabase.auth.getUser();

            if (userError || !user)
                throw new Error("Usuário não autenticado");

            const { data: perfil, error: profileError } =
                await supabase
                    .from("perfil")
                    .select("nome")
                    .eq("id", user.id)
                    .single();

            if (profileError)
                throw profileError;

            let imageUrl = null;

            if (formData.image)
                imageUrl = await uploadImage(formData.image);

            const { data: criacaoData, error: criacaoError } =
                await supabase
                    .from("criacao")
                    .insert([{
                        user_id: user.id,
                        nome_artista: perfil.nome,
                        tipo: selectedType,
                        genre: formData.genre,
                        release_date: formData.releaseDate,
                        image_url: imageUrl
                    }])
                    .select()
                    .single();

            if (criacaoError)
                throw criacaoError;

            criacaoId = criacaoData.id;

            if (selectedType === "Álbum" || selectedType === "Ep") {

                if (!formData.name.trim())
                    throw new Error("Informe o nome do álbum");

                const { data: albumData, error: albumError } =
                    await supabase
                        .from("albums")
                        .insert([{
                            nome_album: formData.name.trim(),
                            criacao_id: criacaoId
                        }])
                        .select()
                        .single();

                if (albumError)
                    throw albumError;

                albumId = albumData.id;

                const { error: updateError } =
                    await supabase
                        .from("criacao")
                        .update({
                            album_id: albumId
                        })
                        .eq("id", criacaoId);

                if (updateError)
                    throw updateError;

                const validTracks =
                    tracks.filter(t => t.name?.trim() && t.file);

                if (validTracks.length === 0)
                    throw new Error("Adicione pelo menos uma música");

                const musicInserts = [];

                for (const track of validTracks) {
                    const audioUrl =
                        await uploadMusic(track.file, user.id);
                    musicInserts.push({
                        criacao_id: criacaoId,
                        nome_musica: track.name.trim(),
                        audio_url: audioUrl
                    });
                }
                const { error: musicError } =
                    await supabase
                        .from("musicas")
                        .insert(musicInserts);
                if (musicError)
                    throw musicError;
            }
            if (
                selectedType === "Música Single" ||
                selectedType === "Podcast"
            ) {
                const track = tracks[0];
                if (!track?.file)
                    throw new Error("Envie um arquivo de áudio");
                const audioUrl =
                    await uploadMusic(track.file, user.id);
                const { error } =
                    await supabase
                        .from("musicas")
                        .insert([{
                            criacao_id: criacaoId,
                            nome_musica:
                                track.name || formData.name,
                            audio_url: audioUrl
                        }]);
                if (error)
                    throw error;
            }
            showToast("Lançamento criado com sucesso");
            setFormData({
                name: "",
                genre: "",
                releaseDate: "",
                image: null,
                imagePreview: null
            });
            setTracks([
                { name: "", file: null }
            ]);
        }
        catch (error) {

            console.error(error);

            if (criacaoId) {

                await supabase
                    .from("musicas")
                    .delete()
                    .eq("criacao_id", criacaoId);

                await supabase
                    .from("albums")
                    .delete()
                    .eq("criacao_id", criacaoId);

                await supabase
                    .from("criacao")
                    .delete()
                    .eq("id", criacaoId);
            }
            showToast(error.message, "error");
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#262B2D] text-white">
            <Header />
            <main className="pt-16 p-6 max-w-6xl mx-auto">
                <motion.h1
                    className="text-4xl font-extrabold text-center mb-8 mt-8 tracking-tight"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Crie seu lançamento
                </motion.h1>
                <motion.div
                    className="flex flex-wrap justify-center gap-4 mb-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {["Álbum", "Ep", "Música Single", "Podcast"].map(item => (
                        <motion.button
                            key={item}
                            onClick={() => {
                                setSelectedType(item);
                                if (item === "Álbum" || item === "Ep") {
                                    setTracks([{ name: "", file: null }]);
                                } else {
                                    setTracks([{ name: "", file: null }]);
                                }
                            }}
                            className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-colors ${selectedType === item
                                ? "bg-gradient-to-r from-[#137FA8] to-[#274E5D] shadow-lg"
                                : "bg-[#274E5D] hover:bg-[#212121]"
                                }`}
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            {item}
                            {selectedType === item && (
                                <span className="w-5 h-5 rounded-full bg-white text-[#137FA8] flex items-center justify-center text-xs font-bold">
                                    ✓
                                </span>
                            )}
                        </motion.button>
                    ))}
                </motion.div>
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <label className="block mb-2 text-xl font-medium">
                            Nome do <span className="text-[#137FA8]">{releaseConfig[selectedType].label}</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={releaseConfig[selectedType].namePlaceholder}
                            className="w-full bg-[#212121] placeholder-white rounded-xl px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#137FA8]"
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <label className="block mb-2 text-xl font-medium">
                            Estilo do <span className="text-[#137FA8]">{releaseConfig[selectedType].label}</span>
                        </label>
                        <div className="relative">
                            <div
                                onClick={() => setGenreOpen(!genreOpen)}
                                className="w-full bg-[#212121] rounded-xl px-4 py-3 shadow-inner cursor-pointer flex justify-between items-center"
                            >
                                <span className={formData.genre}>
                                    {formData.genre || "Selecionar gênero"}
                                </span>
                                <img
                                    src={AngleDown}
                                    className={`w-5 h-5 transition-transform ${genreOpen ? "rotate-180" : ""}`}
                                />
                            </div>
                            <AnimatePresence>
                                {genreOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-50 mt-2 w-full bg-[#1E1E1E] rounded-xl shadow-xl overflow-hidden"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Buscar gênero..."
                                            value={genreSearch}
                                            onChange={(e) => setGenreSearch(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#181818] text-white placeholder-gray-400 outline-none"
                                        />
                                        <div className="max-h-60 overflow-y-auto">
                                            {filteredGenres.length === 0 && (
                                                <div className="px-4 py-3 text-gray-400">
                                                    Nenhum gênero encontrado
                                                </div>
                                            )}
                                            {filteredGenres.map((genre, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            genre
                                                        }));
                                                        setGenreOpen(false);
                                                        setGenreSearch("");
                                                    }}
                                                    className="px-4 py-3 hover:bg-[#137FA8] cursor-pointer transition-colors"
                                                >
                                                    {genre}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                    <AnimatePresence>
                        {(selectedType === "Álbum" || selectedType === "Ep") && (
                            <motion.div
                                className="md:col-span-2 bg-[#212121] p-6 rounded-2xl shadow-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <label className="block mb-4 text-xl font-medium">
                                    Faixas do <span className="text-[#137FA8]">{releaseConfig[selectedType].label}</span>
                                </label>
                                <div className="space-y-4">
                                    {tracks.map((track, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex flex-col gap-2 p-3 bg-[#1E1E1E] rounded-xl shadow-inner"
                                            layout
                                        >
                                            <input
                                                type="text"
                                                value={track.name}
                                                onChange={e => handleTrackNameChange(index, e.target.value)}
                                                placeholder={`Nome da música ${index + 1}`}
                                                className="bg-transparent text-white placeholder-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137FA8]"
                                            />
                                            <input
                                                type="file"
                                                accept="audio/mp3,audio/mpeg"
                                                onChange={e => handleTrackFileChange(index, e.target.files[0])}
                                                className="text-sm text-gray-300"
                                            />
                                            {tracks.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTrack(index)}
                                                    className="self-end text-red-500 hover:text-red-400 font-bold text-sm"
                                                >
                                                    Remover
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addTrack}
                                    className="mt-4 px-5 py-2 bg-[#137FA8] rounded-xl hover:bg-[#274E5D]"
                                >
                                    + Adicionar música
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        {(selectedType === "Música Single" || selectedType === "Podcast") && (
                            <motion.div
                                className="md:col-span-2 bg-[#212121] p-6 rounded-2xl shadow-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <label className="block mb-4 text-xl font-medium">
                                    Arquivo de áudio do{" "}
                                    <span className="text-[#137FA8]">
                                        {releaseConfig[selectedType].label}
                                    </span>
                                </label>
                                <motion.div
                                    className="flex flex-col gap-3 p-4 bg-[#1E1E1E] rounded-xl shadow-inner"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <input
                                        type="text"
                                        placeholder={
                                            selectedType === "Podcast"
                                                ? "Nome do episódio"
                                                : "Nome da música"
                                        }
                                        value={tracks[0]?.name || ""}
                                        onChange={e => handleTrackNameChange(0, e.target.value)}
                                        className="bg-transparent text-white placeholder-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137FA8]"
                                    />
                                    <input
                                        type="file"
                                        accept="audio/mp3,audio/mpeg"
                                        onChange={e => handleTrackFileChange(0, e.target.files[0])}
                                        className="text-sm text-gray-300"
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.div variants={itemVariants}>
                        <label className="block mb-2 text-xl font-medium">
                            Imagem do <span className="text-[#137FA8]">{releaseConfig[selectedType].label}</span>
                        </label>
                        <label className="w-56 h-56 flex items-center justify-center bg-[#212121] rounded-2xl cursor-pointer shadow-lg overflow-hidden">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            {formData.imagePreview ? (
                                <img src={formData.imagePreview} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-[#137FA8] rounded-2xl flex items-center justify-center mb-3">
                                        <img src={Lupa} className="w-8 h-8" />
                                    </div>
                                    <span className="text-gray-400">Clique para adicionar</span>
                                </div>
                            )}
                        </label>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <label className="block mb-2 text-xl font-medium">
                            Data de lançamento do <span className="text-[#137FA8]">{releaseConfig[selectedType].label}</span>
                        </label>
                        <input
                            type="date"
                            name="releaseDate"
                            value={formData.releaseDate}
                            onChange={handleChange}
                            className="w-full bg-[#212121] rounded-xl px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#137FA8]"
                        />
                    </motion.div>
                    <motion.div className="md:col-span-2 flex justify-center mt-8" variants={itemVariants}>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className={`px-10 py-3 rounded-xl shadow-lg transition-all flex items-center gap-3
        ${isLoading
                                    ? "bg-[#274E5D] opacity-70 cursor-not-allowed"
                                    : "bg-gradient-to-r from-[#137FA8] to-[#274E5D] hover:scale-105"
                                }`}
                        >
                            {isLoading && (
                                <motion.span
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                />
                            )}
                            {isLoading ? "Salvando..." : "Salvar lançamento"}
                        </button>
                    </motion.div>
                </motion.div>
            </main>
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
        </div>
    );
}
