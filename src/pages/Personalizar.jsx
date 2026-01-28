import Header from "../components/Header";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function Personalizar() {
    const { bgColor, textColor, setBgColor } = useTheme();

    return (
        <div
            className="min-h-screen transition-colors duration-300"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            <Header />

            <main className="pt-16 p-6 max-w-6xl mx-auto">
                <motion.h1 className="text-4xl mt-8 mb-8 font-extrabold text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Personalize do seu jeito!
                </motion.h1>
                <motion.h4 className="font-bold mt-8 mb-8 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Cor de fundo
                </motion.h4>
                <div className="flex justify-center gap-6">
                    <button
                        onClick={() => setBgColor("#262B2D")}
                        className="w-50 h-50 rounded-3xl border"
                        style={{ backgroundColor: "#262B2D" }}
                    />
                    <button
                        onClick={() => setBgColor("#E8E8E8")}
                        className="w-50 h-50 rounded-3xl border"
                        style={{ backgroundColor: "#E8E8E8" }}
                    />
                    <button
                        onClick={() => setBgColor("#274E5D")}
                        className="w-50 h-50 rounded-3xl border"
                        style={{ backgroundColor: "#274E5D" }}
                    />
                    <button
                        onClick={() => setBgColor("#5C0F0F")}
                        className="w-50 h-50 rounded-3xl border"
                        style={{ backgroundColor: "#5C0F0F" }}
                    />
                </div>
            </main>
        </div>
    );
}
