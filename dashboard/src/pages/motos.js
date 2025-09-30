import { useEffect, useState } from "react";
import api from "../services/api";

function Motos() {
  const [motos, setMotos] = useState([]);

  useEffect(() => {
    api.get("/motos").then((res) => {
      // ordena pela tag_id
      const ordenadas = [...res.data].sort((a, b) =>
        a.tag_id.localeCompare(b.tag_id)
      );
      setMotos(ordenadas);
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🏍️ Motos</h2>
      <ul>
        {motos.map((moto) => (
          <li key={moto.id_moto}>
            {moto.id_moto} - {moto.tag_id} - {moto.placa}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Motos;
