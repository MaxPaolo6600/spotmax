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

    const [tracks, setTracks] = useState([""]);

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
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        setFormData((prev) => ({
            ...prev,
            image: file,
            imagePreview: URL.createObjectURL(file),
        }));
    }

    function handleTrackChange(index, value) {
        const updated = [...tracks];
        updated[index] = value;
        setTracks(updated);
    }

    function addTrack() {
        setTracks((prev) => [...prev, ""]);
    }

    function removeTrack(index) {
        setTracks((prev) => prev.filter((_, i) => i !== index));
    }

    async function uploadImage(file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("albums")
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data, error: urlError } = supabase.storage
            .from("albums")
            .getPublicUrl(fileName);

        if (urlError) throw urlError;

        return data.publicUrl;
    }

    async function handleSubmit() {
        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) throw new Error("Usuário não autenticado");

            let imageUrl = null;
            if (formData.image) imageUrl = await uploadImage(formData.image);

            const { data: criacaoData, error: criacaoError } = await supabase
                .from("criacao")
                .insert([
                    {
                        user_id: user.id,
                        tipo: releaseConfig[selectedType].label,
                        genre: formData.genre,
                        release_date: formData.releaseDate,
                        image_url: imageUrl,
                    },
                ])
                .select()
                .single();

            if (criacaoError) throw criacaoError;

            const criacaoId = criacaoData.id;

            if (selectedType === "Álbum" || selectedType === "Ep") {
                if (formData.name) {
                    const { error: albumError } = await supabase.from("albums").insert([
                        {
                            criacao_id: criacaoId,
                            nome_album: formData.name,
                        },
                    ]);
                    if (albumError) throw albumError;
                }

                const musicInserts = tracks
                    .filter((track) => track.trim() !== "")
                    .map((track) => ({
                        criacao_id: criacaoId,
                        nome_musica: track,
                    }));

                if (musicInserts.length > 0) {
                    const { error: musicError } = await supabase
                        .from("musicas")
                        .insert(musicInserts);
                    if (musicError) throw musicError;
                }
            } else if (selectedType === "Música Single") {
                if (formData.name.trim() !== "") {
                    const { error: musicError } = await supabase.from("musicas").insert([
                        {
                            criacao_id: criacaoId,
                            nome_musica: formData.name.trim(),
                        },
                    ]);
                    if (musicError) throw musicError;
                }
            }

            alert("Criação salva com sucesso!");
            setFormData({
                name: "",
                genre: "",
                releaseDate: "",
                image: null,
                imagePreview: null,
            });
            setTracks([""]);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar criação: " + error.message);
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
                    {["Álbum", "Ep", "Música Single", "Podcast"].map((item) => (
                        <motion.button
                            key={item}
                            onClick={() => setSelectedType(item)}
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
                            className="w-full bg-[#212121] placeholder-white rounded-xl px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#137FA8] transition"
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <label className="block mb-2 text-xl font-medium">Estilo da obra</label>
                        <div className="relative">
                            <select
                                name="genre"
                                value={formData.genre}
                                onChange={handleChange}
                                className="w-full bg-[#212121] rounded-xl px-4 py-3 appearance-none shadow-inner focus:outline-none focus:ring-2 focus:ring-[#137FA8] transition"
                            >
                                <option value="" hidden >
                                    Gêneros musicais
                                </option>
                                <option value="hiphop">Hip Hop</option>
                                <option value="pop">Pop</option>
                                <option value="rock">Rock</option>
                                <option value="eletronica">Eletrônica</option>
                            </select>
                            <img
                                src={AngleDown}
                                alt="seta"
                                className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                            />
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
                                            className="flex items-center justify-between p-2 bg-[#1E1E1E] rounded-xl shadow-inner"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50, opacity: 0 }}
                                            layout
                                        >
                                            <input
                                                type="text"
                                                value={track}
                                                onChange={(e) => handleTrackChange(index, e.target.value)}
                                                placeholder={`Música ${index + 1}`}
                                                className="flex-1 bg-transparent text-white placeholder-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137FA8]"
                                            />
                                            {tracks.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTrack(index)}
                                                    className="ml-4 text-red-500 hover:text-red-400 font-bold text-xl transition"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addTrack}
                                    className="mt-4 px-5 py-2 bg-[#137FA8] rounded-xl hover:bg-[#274E5D] transition shadow-md"
                                >
                                    + Adicionar música
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div variants={itemVariants}>
                        <label className="block mb-2 text-xl font-medium">
                            Imagem do <span className="text-[#137FA8]">{releaseConfig[selectedType].label}</span>
                        </label>
                        <label className="w-56 h-56 flex items-center justify-center bg-[#212121] rounded-2xl cursor-pointer shadow-lg overflow-hidden hover:scale-105 transition-transform">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            {formData.imagePreview ? (
                                <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-[#137FA8] rounded-2xl flex items-center justify-center mb-3">
                                        <img src={Lupa} alt="" className="w-8 h-8" />
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
                            className="w-full bg-[#212121] rounded-xl px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#137FA8] transition"
                        />
                    </motion.div>
                    <motion.div className="md:col-span-2 flex justify-center mt-8" variants={itemVariants}>
                        <button
                            onClick={handleSubmit}
                            className="px-10 py-3 bg-gradient-to-r from-[#137FA8] to-[#274E5D] rounded-xl shadow-lg hover:scale-105 transition-transform"
                        >
                            Salvar lançamento
                        </button>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}
