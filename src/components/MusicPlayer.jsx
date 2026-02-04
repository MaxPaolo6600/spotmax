import { useEffect, useRef } from "react";

export default function MusicPlayer({ track, onClose }) {
    const audioRef = useRef(null);

    useEffect(() => {
        if (track && audioRef.current) {
            audioRef.current.load();
            audioRef.current.play();
        }
    }, [track]);

    if (!track) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-[#212121] border-t border-[#262B2D] p-4 z-50">
            <div className="max-w-6xl mx-auto flex items-center gap-4">
                {track.cover && (
                    <img
                        src={track.cover}
                        alt=""
                        className="w-14 h-14 object-cover rounded"
                    />
                )}

                <div className="flex-1">
                    <p className="font-semibold text-white">
                        {track.title}
                    </p>
                    <audio
                        ref={audioRef}
                        controls
                        className="w-full mt-1"
                    >
                        <source src={track.audioUrl} />
                        Seu navegador não suporta áudio.
                    </audio>
                </div>

                <button
                    onClick={onClose}
                    className="text-[#262B2D] hover:text-white text-xl"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
