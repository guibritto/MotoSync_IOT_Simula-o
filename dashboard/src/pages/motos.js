import { useEffect, useState } from "react";
import api from "../services/api";

function Motos() {
  const [motos, setMotos] = useState([]);

  useEffect(() => {
    api.get("/motos").then((res) => setMotos(res.data));
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
