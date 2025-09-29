import { useEffect, useState } from "react";
import api from "../services/api";

function Historicos() {
  const [historicos, setHistorico] = useState([]);

  useEffect(() => {
    api.get("/historico").then((res) => setHistorico(res.data));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📁 Histórico</h2>
      <ul>
        {historicos.map((historico) => (
          <li key={historico.id_evento}>
            {historico.id_evento} - {historico.id_vaga} - {historico.placa} - {historico.id_acao} - {historico.dt_evento}
          </li>
        ))}
      </ul>
    </div>
  );    
}

export default Historicos;
