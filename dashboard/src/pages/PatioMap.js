import { useEffect, useState } from "react";
import api from "../services/api";

function PatioMap() {
  const [anchors, setAnchors] = useState([]);
  const [vagas, setVagas] = useState([]);
  const [ocupacao, setOcupacao] = useState([]);

  useEffect(() => {
    api.get("/anchors")
      .then((res) => {
        setAnchors(res.data);
      })

    api.get("/vagas")
      .then((res) => {
        setVagas(res.data);
      })


    api.get("/ocupacao")
      .then((res) => setOcupacao(res.data))
  }, []);

  // Descobre se a vaga está ocupada
  const isVagaOcupada = (vagaId) =>
    ocupacao.some((o) => o.id_vaga === vagaId);

  // Retorna o número de ocupações para uma vaga
  const ocupacoesNaVaga = (vagaId) => 
    ocupacao.filter((o) => o.id_vaga === vagaId).length;

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
                {vagas.map((vaga, idx) => {
                  // Log para debug
                  console.log("Vaga:", vaga);

                  // Parse para garantir que são números
                  const x = Number(vaga.x_coord);
                  const y = Number(vaga.y_coord);
                  const largura = 1.1; // largura fixa
                  const altura = 2.0;  // altura fixa

                  // Se algum campo não for número ou não existir, não renderiza
                  if (
                    !vaga.id_vaga ||
                    isNaN(x) ||
                    isNaN(y)
                  ) return null;

                  // Lógica de cor:
                  let fill = "lightgreen";
                  let stroke = "green";
                  const ocupacoes = ocupacoesNaVaga(vaga.id_vaga);

                  if (ocupacoes > 1) {
                    fill = "#FFFF70"; // amarelo
                    stroke = "#ff8700";
                  } else if (ocupacoes === 1) {
                    fill = "#FFCCCB"; // vermelho claro
                    stroke = "red";
                  }

                  return (
                    <g key={vaga.id_vaga || idx}>
                      <rect
                        x={x * 40 + 10}
                        y={y * 40 + 10}
                        width={largura * 40}
                        height={altura * 40}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={2}
                        rx={3}
                      />
                      <text
                        x={x * 40 + 18}
                        y={y * 40 + 25}
                        fontSize="15"
                        fill={stroke}
                        fontWeight="700"
                      >
                        {vaga.codigo}
                      </text>
                    </g>
                  );
                })}
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
                {[...ocupacao]
                    .sort((a, b) => String(a.tag_id).localeCompare(String(b.tag_id)))
                    .map((ocupacao) => (
                        <li key={ocupacao.id_ocupacao}>
                            {ocupacao.tag_id} - {ocupacao.codigo} - {ocupacao.placa || "Livre"}
                        </li>
                    ))}
            </ul>
        </div>
      </div>
    </div>
  );
}

export default PatioMap;