import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Lobby from "./pages/Lobby.jsx";
import Watch from "./pages/Watch.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:code/play" element={<Lobby />} />
      <Route path="/room/:code/watch" element={<Watch />} />
    </Routes>
  );
}
