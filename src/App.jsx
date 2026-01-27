import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Perfil from "./pages/Perfil"
import Estudio from "./pages/Estudio"
import Cadastro from "./pages/Cadastro"
import MinhasObras from "./pages/MinhasObras"
import Login from "./pages/Login"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Perfil" element={<Perfil />} />
        <Route path="/Estudio" element={<Estudio />} />
        <Route path="/Cadastro" element={<Cadastro />} />
        <Route path="/MinhasObras" element={<MinhasObras />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </Router>
  );
}
