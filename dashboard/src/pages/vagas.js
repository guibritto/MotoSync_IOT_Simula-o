import { useEffect, useState } from "react";
import api from "../services/api";

function Vagas() {
  const [vagas, setVagas] = useState([]);

  useEffect(() => {
    api.get("/vagas").then((res) => setVagas(res.data));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📍 Vagas</h2>
      <ul>
        {vagas.map((vaga) => (
          <li key={vaga.id_vaga}>
            {vaga.id_vaga} - {vaga.codigo}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Vagas;
