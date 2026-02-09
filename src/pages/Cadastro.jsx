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

    // TOAST STATE
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const navigate = useNavigate();

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function validate() {
        const newErrors = {};

        if (!form.email) newErrors.email = "E-mail obrigatório";
        if (!form.nome) newErrors.nome = "Nome obrigatório";
        if (form.senha.length < 6)
            newErrors.senha = "Senha mínima de 6 caracteres";

        return newErrors;
    }

    // TOAST FUNCTION
    function showToast(message, type = "success") {

        setToast({
            show: true,
            message,
            type,
        });

        setTimeout(() => {
            setToast(prev => ({
                ...prev,
                show: false,
            }));
        }, 3500);
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

        try {

            const { data, error } =
                await supabase.auth.signUp({

                    email: form.email,

                    password: form.senha,

                    options: {
                        data: {
                            nome: form.nome,
                        },
                    },
                });

            if (error)
                throw error;

            const user = data.user;

            const { error: perfilError } =
                await supabase
                    .from("perfil")
                    .insert({

                        id: user.id,
                        email: form.email,
                        nome: form.nome,

                    });

            if (perfilError)
                throw perfilError;

            // SUCCESS
            showToast("Conta criada com sucesso");

            // REDIRECT AFTER TOAST
            setTimeout(() => {

                navigate("/Login");

            }, 1200);

        }
        catch (error) {

            console.error(error);

            showToast(error.message, "error");

        }
        finally {

            setLoading(false);

        }
    }

    return (

        <motion.main className="pt-16 min-h-screen bg-[#262B2D] flex items-center justify-center px-4">

            <motion.div
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 60 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-[#137FA8] rounded-2xl shadow-2xl p-8"
            >

                <h2 className="text-2xl font-semibold text-white text-center mb-6">
                    Criar conta
                </h2>

                <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>

                        <label className="text-white text-sm">
                            E-mail
                        </label>

                        <input
                            name="email"
                            type="email"
                            onChange={handleChange}
                            className="w-full rounded-lg bg-[#D9D9D9] px-4 py-3"
                        />

                        <ErrorMessage message={errors.email} />

                    </div>

                    <div>

                        <label className="text-white text-sm">
                            Nome de usuário
                        </label>

                        <input
                            name="nome"
                            type="text"
                            onChange={handleChange}
                            className="w-full rounded-lg bg-[#D9D9D9] px-4 py-3"
                        />

                        <ErrorMessage message={errors.nome} />

                    </div>

                    <div>

                        <label className="text-white text-sm">
                            Senha
                        </label>

                        <input
                            name="senha"
                            type="password"
                            onChange={handleChange}
                            className="w-full rounded-lg bg-[#D9D9D9] px-4 py-3"
                        />

                        <ErrorMessage message={errors.senha} />

                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-[#212121] text-white py-3 rounded-lg"
                    >

                        {loading
                            ? "Criando..."
                            : "Cadastrar"}

                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/Login")}
                        className="w-full bg-[#262B2D] text-white py-2 rounded-lg"
                    >
                        Logar
                    </button>

                </motion.form>

            </motion.div>

            {/* TOAST */}
            <AnimatePresence>

                {toast.show && (

                    <motion.div

                        initial={{
                            opacity: 0,
                            y: 40
                        }}

                        animate={{
                            opacity: 1,
                            y: 0
                        }}

                        exit={{
                            opacity: 0,
                            y: 40
                        }}

                        className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl text-white
                        
                        ${toast.type === "success"
                                ? "bg-[#137FA8]"
                                : "bg-[#5C0F0F]"
                            }`}

                    >

                        <div className="flex gap-4 items-center">

                            <span className="font-semibold">

                                {toast.message}

                            </span>

                            <button
                                onClick={() =>
                                    setToast(prev => ({
                                        ...prev,
                                        show: false
                                    }))
                                }
                                className="text-xl"
                            >
                                ×
                            </button>

                        </div>

                    </motion.div>

                )}

            </AnimatePresence>

        </motion.main>
    );
}

function ErrorMessage({ message }) {

    if (!message)
        return null;

    return (

        <p className="text-red-200 text-sm text-center">

            {message}

        </p>

    );
}
