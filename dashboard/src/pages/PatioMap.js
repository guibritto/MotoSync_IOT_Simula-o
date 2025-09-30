import { useEffect, useState } from "react";
import api from "../services/api";

function PatioMap() {
  const [anchors, setAnchors] = useState([]);
  const [vagas, setVagas] = useState([]);
  const [ocupacao, setOcupacao] = useState([]);
  const [historico, setHistorico] = useState([]); // Novo estado para o histórico

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

    // Nova chamada para buscar o histórico
    api.get("/historico")
      .then((res) => setHistorico(res.data))
  }, []);

  // Retorna o número de ocupações para uma vaga
  const ocupacoesNaVaga = (vagaId) => 
    ocupacao.filter((o) => o.id_vaga === vagaId).length;

  // Cálculo da taxa de ocupação
  const totalVagas = vagas.length;
  const vagasOcupadas = vagas.filter(vaga => ocupacoesNaVaga(vaga.id_vaga) > 0).length;
  const taxaOcupacao = totalVagas > 0 ? ((vagasOcupadas / totalVagas) * 100).toFixed(1) : "0";

  // Quantidade de ocorrências (vagas com mais de uma ocupação)
  const ocorrencias = vagas.filter(vaga => ocupacoesNaVaga(vaga.id_vaga) > 1).length;

  // Limites do gráfico (ajusta conforme necessário)
  const padding = 20;

  return (
    <div>
      <div style={{
        display: "flex",
        gap: 24,
        marginBottom: 20
      }}>
        {/* Card Taxa de Ocupação */}
        <div style={{
          background: "#ffffffff",
          padding: "16px 24px",
          borderRadius: 8,
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.07)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: 300,
        }}>
          <h2 style={{margin: 0, fontSize: 22}}>Taxa de Ocupação do Pátio</h2>
          <span style={{fontSize: 32, fontWeight: "bold", color: "#0074D9"}}>
            {taxaOcupacao}%
          </span>
          <div style={{fontSize: 14, color: "#555"}}>
            ({vagasOcupadas} de {totalVagas} vagas ocupadas)
          </div>
        </div>
        {/* Card Ocorrências */}
        <div style={{
          background: "#ffffffff",
          padding: "16px 24px",
          borderRadius: 8,
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.07)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: 300,
        }}>
          <h2 style={{margin: 0, fontSize: 22}}>Ocorrências no Pátio</h2>
          <span style={{fontSize: 32, fontWeight: "bold", color: "#ff8700"}}>
            {ocorrencias}
          </span>
          <div style={{fontSize: 14, color: "#555"}}>
            Vagas com mais de uma ocupação
          </div>
        </div>
      </div>
      <h2>Mapa do Pátio 🚦</h2>
      <div style={{ display: "flex" }}>
        {/* Mapa SVG */}
        <div style={{ borderRadius: 8, background: "#ffffffff", boxShadow: "0 3px 10px rgba(0, 0, 0, 0.07)" }}>
          <div style={{marginTop: 10, marginLeft: 100}}>
                <span>🟩 Livre | </span>
                <span>🟥 Ocupada | </span>
                <span>🟨 Ocorrência | </span>
            <span>🔵 Anchor</span>
            </div>
            <svg width="650" height="640">
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
        </div>

        {/* Ocupações */}
        <div style={{
          borderRadius: 8,
          background: "#ffffffff",
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.07)",
          padding: 20,
          marginLeft: 20,
          height: 600,
          overflowY: "auto",
          minWidth: 280
        }}>
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

        {/* Histórico */}
        <div style={{
          borderRadius: 8,
          background: "#ffffffff",
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.07)",
          padding: 20,
          marginLeft: 20,
          height: 600,
          overflowY: "auto",
          minWidth: 280
        }}>
          <h2>📜 Histórico</h2>
          <ul>
            {(Array.isArray(historico) ? historico : []).map((historico) => (
              <li key={historico.id_evento}>
                {historico.id_evento} - {historico.codigo} - {historico.placa} - {historico.acao} - {historico.dt_evento}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PatioMap;