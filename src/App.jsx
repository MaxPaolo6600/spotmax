import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Perfil from "./pages/Perfil";
import Estudio from "./pages/Estudio";
import Cadastro from "./pages/Cadastro";
import MinhasObras from "./pages/MinhasObras";
import Personalizar from "./pages/Personalizar";
import Login from "./pages/Login";

import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/Perfil" element={<Perfil />} />
                    <Route path="/Estudio" element={<Estudio />} />
                    <Route path="/Cadastro" element={<Cadastro />} />
                    <Route path="/MinhasObras" element={<MinhasObras />} />
                    <Route path="/Personalizar" element={<Personalizar />} />
                    <Route path="/Login" element={<Login />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}
