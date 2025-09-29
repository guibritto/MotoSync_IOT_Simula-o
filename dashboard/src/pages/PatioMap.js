import { useEffect, useState } from "react";
import api from "../services/api";

function PatioMap() {
  const [anchors, setAnchors] = useState([]);
  const [vagas, setVagas] = useState([]);
  const [ocupacao, setOcupacao] = useState([]);

  useEffect(() => {
    api.get("/anchors").then((res) => setAnchors(res.data));
    api.get("/vagas").then((res) => {
      console.log("Vagas:", res.data); // Adicione este log
      setVagas(res.data);
    });
    api.get("/ocupacao").then((res) => setOcupacao(res.data));
  }, []);

  // Descobre se a vaga está ocupada
  const isVagaOcupada = (vagaId) =>
    ocupacao.some((o) => o.vaga === vagaId && o.placa);

  // Limites do gráfico (ajusta conforme necessário)
  const padding = 20;

  return (
    <div>
      <div style={{ display: "flex"  }}>
        <div>
            <svg width="650" height="640" style={{ border: "1px solid #ccc" }}>
                {/* Anchors */}
                {anchors.map(anchor => (
                <g key={anchor.id_anchor}>
                    <circle
                    cx={anchor.x_coord * 40 + padding}
                    cy={anchor.y_coord * 40 + padding}
                    r={6}
                    fill="#0074D9"
                    stroke="#000"
                    strokeWidth={1}
                    />
                    <text
                    x={anchor.x_coord * 40 + padding + 10}
                    y={anchor.y_coord * 40 + padding}
                    fontSize="12"
                    fill="#0074D9"
                    alignmentBaseline="middle"
                    >
                    {anchor.codigo}
                    </text>
                </g>
                ))}

                {/* Vagas */}
                {vagas.map(vaga => (
                <g key={vaga.id_vaga}>
                  <rect
                  x={vaga.x_coord * 40 + padding}
                  y={vaga.y_coord * 40 + padding - vaga.altura * 40}
                  width={vaga.largura * 40} // escala visual
                  height={vaga.altura * 40} // escala visual
                  fill={isVagaOcupada(vaga.id_vaga) ? "red" : "green"}
                  stroke="#222"
                  strokeWidth={1}
                  rx={3}
                  />
                  <text
                  x={vaga.x_coord * 40 + padding + 5}
                  y={vaga.y_coord * 40 + padding - vaga.altura * 40 + 15}
                  fontSize="10"
                  fill="#000"
                  >
                  {vaga.codigo}
                  </text>
                </g>
                ))}
            </svg>
            <div style={{marginTop: 10}}>
                <span>🟩 Livre | </span>
                <span>🟥 Ocupada | </span>
                <span>🟨 Ocorrência | </span>
            <span>🔵 Anchor</span>
            </div>
        </div>

        <div>
            <h2>📍 Ocupações</h2>
            <ul>
                {ocupacao.map((ocupacao) => (
                <li key={ocupacao.id_ocupacao}>
                    {ocupacao.codigo} - {ocupacao.tag_id} - {ocupacao.placa || "Livre"}
                </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
}

export default PatioMap;