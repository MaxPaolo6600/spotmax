import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";

export default function MinhasObras() {
    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchObras();
    }, []);

    async function fetchObras() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("criacao")
                .select(`
                id,
                tipo,
                genre,
                release_date,
                image_url,
                albums!inner(nome_album),
                musicas (
                    nome_musica
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


    if (loading) {
        return (
            <div className="min-h-screen bg-[#262B2D] text-white flex items-center justify-center">
                Carregando...
            </div>
        );
    }

    return (
        <div>
            <Header />
            <main className="pt-20 p-6 bg-[#262B2D] min-h-screen text-white">
                <h1 className="text-3xl font-bold mb-8 text-center">Minhas Obras</h1>

                {obras.length === 0 ? (
                    <p className="text-center text-gray-400">
                        Você ainda não criou nenhuma obra.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {obras.map((obra) => (
                            <div
                                key={obra.id}
                                className="bg-[#212121] rounded-xl p-4 hover:bg-[#274E5D] transition"
                            >
                                {obra.image_url && (
                                    <img
                                        src={obra.image_url}
                                        alt=""
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                    />
                                )}
                                <h2 className="text-xl font-semibold mb-2">
                                    {obra.albums?.[0]?.nome_album
                                        || (obra.musicas && obra.musicas.length === 1 ? obra.musicas[0].nome_musica : obra.tipo)
                                    }
                                </h2>
                                {obra.musicas && obra.musicas.length > 0 && (
                                    <ul className="text-gray-400 text-sm mb-2 list-disc list-inside">
                                        {obra.musicas.map((musica, idx) => (
                                            <li key={idx}>{musica.nome_musica}</li>
                                        ))}
                                    </ul>
                                )}
                                <p className="text-sm text-gray-400 capitalize">
                                    {obra.tipo} • {obra.genre}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {obra.release_date}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
