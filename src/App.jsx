import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Words from "./pages/Words";
import Random from "./pages/Random";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="w-full bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Lugat</h1>
        <nav className="flex gap-4">
          <Link to="/" className="hover:underline">
            So‘zlar
          </Link>
          <Link to="/quiz" className="hover:underline">
            Quiz
          </Link>
        </nav>
      </header>

      <div className="flex-1 w-full flex items-center justify-center p-4">
        <Routes>
          <Route path="/" element={<Words />} />
          <Route path="/quiz" element={<Random />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
