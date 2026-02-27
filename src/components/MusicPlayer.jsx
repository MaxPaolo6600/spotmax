import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MusicPlayer({ track, onClose }) {
    const audioRef = useRef(null);

    useEffect(() => {
        if (track && audioRef.current) {
            audioRef.current.load();
            audioRef.current.play();
        }
    }, [track]);

    return (
        <AnimatePresence>
            {track && (
                <motion.div
                    initial={{ y: 120, opacity: 0, scale: 0.98 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 120, opacity: 0, scale: 0.98 }}
                    transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 18,
                    }}
                    className="fixed bottom-0 left-0 w-full bg-[#212121] border-t border-[#262B2D] p-4 z-50"
                >
                    <div className="max-w-6xl mx-auto flex items-center gap-4">
                        {track.cover && (
                            <motion.img
                                src={track.cover}
                                alt=""
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="w-14 h-14 object-cover rounded"
                            />
                        )}
                        <div className="flex-1">
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="font-semibold text-white"
                            >
                                {track.nome_musica}
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="font-semibold text-white"
                            >
                                {track.nome_artista}
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="font-semibold text-white"
                            >
                                {track.nome_album}
                            </motion.p>
                        </div>
                        <div className="flex-1">
                            <audio
                                ref={audioRef}
                                controls
                                className="w-full mt-1"
                            >
                                <source src={track.audio_url} />
                                Seu navegador não suporta áudio.
                            </audio>
                        </div>
                        <motion.button
                            onClick={onClose}
                            whileHover={{ scale: 1.2, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-[#ffffff] hover:text-white text-xl transition-colors"
                        >
                            ✕
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}