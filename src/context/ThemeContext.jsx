import { createContext, useContext, useState, useEffect } from "react";
const ThemeContext = createContext();
export function ThemeProvider({ children }) {
    const [bgColor, setBgColor] = useState(() => {
        return localStorage.getItem("bgColor") || "#262B2D";
    });
    useEffect(() => {
        localStorage.setItem("bgColor", bgColor);
    }, [bgColor]);
    const isDarkBg = (color) =>
        ["#262B2D", "#212121", "#274E5D", "#5C0F0F"].includes(color);
    const textColor = isDarkBg(bgColor) ? "#FFFFFF" : "#262B2D";
    return (
        <ThemeContext.Provider
            value={{
                bgColor,
                textColor,
                setBgColor,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}
export function useTheme() {
    return useContext(ThemeContext);
}