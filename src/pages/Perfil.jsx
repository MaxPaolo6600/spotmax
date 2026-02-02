import { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";
import { useTheme } from "../context/ThemeContext";

export default function Perfil() {
    const { bgColor, textColor } = useTheme();

    const [user, setUser] = useState(null);
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            if (data.user) {
                buscarPerfil(data.user.id);
            }
        };
        getUser();
    }, []);

    const buscarPerfil = async (userId) => {
        const { data } = await supabase
            .from("perfil")
            .select("foto")
            .eq("id", userId)
            .single();

        if (data?.foto) {
            setPreview(data.foto);
        }
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFoto(file);
        setPreview(URL.createObjectURL(file));
    };

    const salvarFoto = async () => {
        if (!foto || !user) return;

        setLoading(true);

        const fileExt = foto.name.split(".").pop();
        const fileName = `${user.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("fotos-perfil")
            .upload(fileName, foto, { upsert: true });

        if (uploadError) {
            alert("Erro ao enviar foto");
            setLoading(false);
            return;
        }

        const { data } = supabase.storage
            .from("fotos-perfil")
            .getPublicUrl(fileName);

        await supabase.from("perfil").upsert({
            id: user.id,
            foto: data.publicUrl,
        });

        setLoading(false);
        alert("Foto atualizada com sucesso!");
    };

    return (
        <div
            className="min-h-screen transition-colors duration-300"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            <Header />

            <main className="pt-16 p-6 max-w-6xl mx-auto">
                <div className="flex flex-col items-start gap-4">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative w-32 h-32 cursor-pointer"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <motion.img
                            src={preview || "/avatar-placeholder.png"}
                            alt="Foto de perfil"
                            className="w-32 h-32 rounded-full object-cover border"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        />
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-white text-sm font-medium"
                        >
                            Alterar foto
                        </motion.div>
                    </motion.div>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFotoChange}
                        className="hidden"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={salvarFoto}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Salvando..." : "Salvar foto"}
                    </motion.button>
                </div>
            </main>
        </div>
    );
}
