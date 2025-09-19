import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./common/context/ThemeContext";
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
