import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
    const [form, setForm] = useState({
        email: "",
        nome: "",
        senha: "",
    });

    const [errors, setErrors] = useState({});
    const [authError, setAuthError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function validate() {
        const newErrors = {};

        if (!form.email) newErrors.email = "E-mail obrigatório";
        if (!form.nome) newErrors.nome = "Nome obrigatório";
        if (form.senha.length < 6) newErrors.senha = "Senha mínima de 6 caracteres";

        return newErrors;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setAuthError(null);
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email: form.email,
            password: form.senha,
            options: {
                data: {
                    nome: form.nome,
                },
            },
        });

        setLoading(false);

        if (error) {
            setAuthError(error.message);
            return;
        }

        alert("Conta criada com sucesso! Verifique seu e-mail.");
    }

    return (
        <motion.main className="pt-16 min-h-screen bg-[#262B2D] flex items-center justify-center px-4">
            <motion.div
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 60 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md bg-[#137FA8] rounded-2xl shadow-2xl p-8"
            >
                <h2 className="text-2xl font-semibold text-white text-center mb-6">
                    Criar conta
                </h2>
                <motion.form
                    onSubmit={handleSubmit}
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.15 },
                        },
                    }}
                    className="space-y-5"
                >
                    <motion.div variants={item}>
                        <label className="block text-sm text-white mb-1">
                            E-mail
                        </label>
                        <input
                            name="email"
                            type="email"
                            onChange={handleChange}
                            className="w-full rounded-lg bg-[#D9D9D9] text-[#5C0F0F] px-4 py-3 outline-none focus:ring-2 focus:ring-[#5C0F0F]"
                        />
                        <ErrorMessage message={errors.email} />
                    </motion.div>
                    <motion.div variants={item}>
                        <label className="block text-sm text-white mb-1">
                            Nome do usuário
                        </label>
                        <input
                            name="nome"
                            type="text"
                            onChange={handleChange}
                            className="w-full rounded-lg bg-[#D9D9D9] text-[#5C0F0F] px-4 py-3 outline-none focus:ring-2 focus:ring-[#5C0F0F]"
                        />
                        <ErrorMessage message={errors.nome} />
                    </motion.div>
                    <motion.div variants={item}>
                        <label className="block text-sm text-white mb-1">
                            Senha
                        </label>
                        <input
                            type="password"
                            name="senha"
                            onChange={handleChange}
                            className="w-full rounded-lg bg-[#D9D9D9] text-[#5C0F0F] px-4 py-3 outline-none focus:ring-2 focus:ring-[#5C0F0F]"
                        />
                        <ErrorMessage message={errors.senha} />
                    </motion.div>
                    <motion.button
                        whileHover={!loading ? { scale: 1.03 } : {}}
                        whileTap={!loading ? { scale: 0.97 } : {}}
                        disabled={loading}
                        className="w-full mt-4 bg-[#212121] text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {loading && (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {loading ? "Criando..." : "Cadastrar"}
                    </motion.button>
                    <ErrorMessage message={authError} />
                    <motion.button
                        onClick={() => navigate("/Login")}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full mt-2 bg-[#262B2D] text-white font-semibold py-1 rounded-lg"
                    >
                        Logar
                    </motion.button>
                </motion.form>
            </motion.div>
        </motion.main>
    );
}

const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

function ErrorMessage({ message }) {
    return (
        <AnimatePresence>
            {message && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm text-red-200 mt-1 text-center"
                >
                    {message}
                </motion.p>
            )}
        </AnimatePresence>
    );
}
