import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [bgColor, setBgColor] = useState("#262B2D");

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