import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";

export default function Header() {
    const [menuAberto, setMenuAberto] = useState(false);
    const [user, setUser] = useState(null);
    const [fotoPerfil, setFotoPerfil] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        async function getUserAndProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data, error } = await supabase
                    .from("perfil")
                    .select("foto")
                    .eq("id", user.id)
                    .single();

                if (!error && data?.foto) {
                    setFotoPerfil(data.foto);
                }
            }
        }

        getUserAndProfile();

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user || null);

                if (session?.user) {
                    const { data } = await supabase
                        .from("perfil")
                        .select("foto")
                        .eq("id", session.user.id)
                        .single();

                    setFotoPerfil(data?.foto || null);
                } else {
                    setFotoPerfil(null);
                }
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (menuAberto) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        const handleEsc = (e) => {
            if (e.key === "Escape") setMenuAberto(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [menuAberto]);
    async function handleLogout() {
        await supabase.auth.signOut();
        navigate("/Login");
    }
    return (
        <>
            <header className="bg-[#212121] flex justify-between items-center px-4 h-16 fixed top-0 left-0 w-full z-50">
                <div className="w-full">
                    <motion.button
                        onClick={() => setMenuAberto(prev => !prev)}
                        className="border-2 p-1 border-[#274E5D] rounded-2xl text-white text-xl"
                        aria-label="Abrir menu"
                        animate={{
                            rotate: menuAberto ? 90 : 0,
                            scale: menuAberto ? 1.1 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 1.3 }}
                    >
                        <AnimatePresence mode="wait">
                            {menuAberto ? (
                                <motion.img
                                    key="close"
                                    src="./src/assets/cross.png"
                                    className="h-8 w-8 m-1"
                                    initial={{ opacity: 0, rotate: -90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 90 }}
                                />
                            ) : (
                                <motion.img
                                    key="menu"
                                    src="./src/assets/menu-hamburguer (1).png"
                                    className="h-8 w-8 m-1"
                                    initial={{ opacity: 0, rotate: 90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: -90 }}
                                />
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
                <div className="w-full flex justify-center">
                    <h1
                        onClick={() => navigate("/")}
                        className="text-white text-xl cursor-pointer"
                    >
                        Logo
                    </h1>
                </div>
                <div className="w-full flex justify-end items-center">
                    {!user ? (
                        <>
                            <motion.button
                                onClick={() => navigate("/Login")}
                                className="border-2 border-[#137FA8] bg-[#274E5D] me-4 h-10 px-3 rounded-2xl font-bold text-[#212121]"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 1.3 }}
                            >
                                Logar
                            </motion.button>
                            <motion.button
                                onClick={() => navigate("/Cadastro")}
                                className="border-2 border-[#137FA8] bg-[#274E5D] me-4 h-10 px-3 rounded-2xl font-bold text-[#212121]"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 1.3 }}
                            >
                                Cadastrar
                            </motion.button>
                        </>
                    ) : (
                        <>
                            <motion.button
                                onClick={() => navigate("/perfil")}
                                className="border-2 p-1 border-[#274E5D] rounded-full text-white text-xl me-3"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 1.3 }}
                            >
                                <motion.img
                                    src={fotoPerfil || "./src/assets/do-utilizador (1).png"}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            </motion.button>
                        </>
                    )}
                </div>
            </header>
            <AnimatePresence>
                {menuAberto && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMenuAberto(false)}
                            className="fixed inset-0 top-16 bg-black/50 z-40"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ stiffness: 260, damping: 25 }}
                            className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-[#212121] z-40 shadow-2xl p-6 flex flex-col"
                        >
                            <nav className="flex flex-col gap-4">
                                <motion.button
                                    onClick={() => navigate("/")}
                                    className="text-white bg-[#262B2D] flex border-2 border-[#5C0F0F] rounded-2xl p-2"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 1.3 }}
                                >
                                    <img src="./src/assets/casa.png" className="h-6 ms-2" />
                                    <h3 className="ms-4">Home</h3>
                                </motion.button>
                                <hr className="text-[#274E5D]" />
                                <motion.button
                                    to="/"
                                    onClick={() => setMenuAberto(false)}
                                    className="text-white bg-[#262B2D] flex border-2 border-[#5C0F0F] rounded-2xl p-2"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 1.3 }}
                                >
                                    <img src="./src/assets/estatisticas.png" className="h-6 ms-2" />
                                    <h3 className="ms-4">Top 50 global</h3>
                                </motion.button>
                                <motion.button
                                    to="/"
                                    onClick={() => setMenuAberto(false)}
                                    className="text-white bg-[#262B2D] flex border-2 border-[#5C0F0F] rounded-2xl p-2"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 1.3 }}
                                >
                                    <img src="./src/assets/estatisticas.png" className="h-6 ms-2" />
                                    <h3 className="ms-4">Top 50 nacional</h3>
                                </motion.button>
                                <hr className="text-[#274E5D]" />
                                <motion.button
                                    to="/"
                                    className="text-white bg-[#262B2D] flex border-2 border-[#5C0F0F] rounded-2xl p-2"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 1.3 }}
                                >
                                    <img src="./src/assets/cartao-de-credito.png" className="h-6 ms-2" />
                                    <h3 className="ms-4">Assinaturas</h3>
                                </motion.button>
                                <hr className="text-[#274E5D]" />
                                <motion.button
                                    onClick={() => navigate("/MinhasObras")}
                                    className="text-white bg-[#262B2D] flex border-2 border-[#274E5D] rounded-2xl p-2"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 1.3 }}
                                >
                                    <img src="./src/assets/edit.png" className="h-6 ms-2" />
                                    <h3 className="ms-4">Minhas Criações</h3>
                                </motion.button>
                                <motion.button
                                    onClick={() => navigate("/Estudio")}
                                    className="text-white bg-[#262B2D] flex border-2 border-[#274E5D] rounded-2xl p-2"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 1.3 }}
                                >
                                    <img src="./src/assets/almoco-foguete.png" className="h-6 ms-2" />
                                    <h3 className="ms-4">Publicar Obra</h3>
                                </motion.button>
                                <motion.button
                                    onClick={() => navigate("/Personalizar")}
                                    className="text-white bg-[#212121] flex border-2 border-[#274E5D] rounded-2xl p-2 justify-center"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 1.3 }}
                                >
                                    <h3 className="text-[#274E5D]">Personalizar Layout</h3>
                                </motion.button>
                            </nav>
                            {user && (
                                <motion.button
                                    onClick={handleLogout}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 1.3 }}
                                    className="mt-auto bg-[#5C0F0F] h-10 px-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                                >
                                    Sair
                                </motion.button>
                            )}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}