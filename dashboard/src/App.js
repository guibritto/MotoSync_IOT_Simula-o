import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Motos from "./pages/motos";
import Vagas from "./pages/vagas";
import { useEffect, useState } from "react";
import api from "./services/api";
import PatioMap from "./pages/PatioMap";

function Home() {
  const [ocupacao, setOcupacao] = useState([]);

  useEffect(() => {
    api.get("/ocupacao")
      .then((res) => setOcupacao(res.data))
      .catch((err) => console.error(err));
  }, []);

  const getVagasStatus = () => {
    const vagas = {};
    ocupacao.forEach((item) => {
      if (!vagas[item.vaga]) {
        vagas[item.vaga] = [];
      }
      if (item.placa) {
        vagas[item.vaga].push(item.placa);
      }
    });
    return vagas;
  };

  const vagas = getVagasStatus();

  return (
    <div>
      <PatioMap vagasStatus={vagas} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <h1>🚀 Dashboard Mottu</h1>

        <nav style={{ marginBottom: "20px" }}>
          <Link to="/" style={{ marginRight: "15px" }}>
            Dashboard
          </Link>
          <Link to="/motos" style={{ marginRight: "15px" }}>
            Motos
          </Link>
          <Link to="/vagas">Vagas</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/motos" element={<Motos />} />
          <Route path="/vagas" element={<Vagas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
