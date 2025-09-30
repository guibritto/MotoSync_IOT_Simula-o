# Mottu SmartPark (Protótipo IoT / RTLS UWB)

## Integrantes
- Guilherme Gonçalves Britto - RM558475
- Thiago Mendes do Nascimento - RM555352
- Vinicius Banciela Breda Lopes - RM558117

---

## Link do vídeo
`https://youtu.be/u5RAoe6PshI`

---

## 📌 1. Resumo do projeto

**Mottu SmartPark** é um protótipo simulado de sistema de localização de motos em pátios usando **UWB (Ultra-Wideband)**.  
O objetivo é **monitorar em tempo real a posição das motos**, identificar se estão corretamente alocadas em suas vagas (`A01`, `A02`...), gerar métricas de confiabilidade e apoiar a operação da Mottu em escala nacional.

O protótipo simula **leitura, tratamento e visualização de dados IoT**:

- Geração de dataset sintético (CSV com leituras ToF/distâncias);
- Trilateração para calcular posições `(x, y)`;
- Mapeamento das motos em vagas;
- Regras de ocupação (janela de 15s);
- Visualização do pátio (matplotlib).

Além disso, desenvolvemos uma **API REST** em FastAPI que permite:

- Consultar motos, vagas, ocupações e histórico de eventos;
- Cadastrar novas motos;
- Estacionar, mover e remover motos do sistema;
- Integrar o backend ao dashboard web para visualização e controle em tempo real.

---

## 🏗️ 2. Arquitetura da solução

### Sensoriamento (UWB)

- **Tags**: DWM1001-DEV (instaladas nas motos).
- **Anchors**: Skylab VDU2501 fixados em postes/teto (6 por pátio).
- **Intervalo de transmissão**: 500 ms (trade-off entre bateria e responsividade).

### Edge (pátio local)

- Servidor local processa trilateração (mínimo 3 anchors).
- Banco local (PostgreSQL ou TimescaleDB) armazena dados.
- Regras de negócio aplicadas localmente (15s parado = ocupado).

### Cloud / Dashboard

- Backup e agregação em tempo real.
- Dashboard com indicadores por pátio.
- Possibilidade de Machine Learning para detectar conflitos ou erros.

---

## ⚙️ 3. Funcionalidades já implementadas

- **CSV sintético**: leitura de múltiplos anchors/tags simulados.
- **Trilateração** (least squares) → posição `(x, y)`.
- **Confiança posicional** via RMS residual.
- **Mapa do pátio (matplotlib)**: vagas (`A01...`), anchors, motos.
- **Associação tag → vaga** com base em posição.
- **Regra de ocupação**: 15s parado em uma vaga.
- **Saída CSV** com vagas ocupadas.

---

## 🖥️ 4. Tecnologias esperadas

- **Python 3.12**
- Bibliotecas:
  - `numpy`, `pandas`, `matplotlib`, `scipy`
  - `scikit-learn` ou `lightgbm` (para ML opcional)
- **Banco de dados**: OracleDB.
- **Mensageria (simulada)**: MQTT para ingestão.
- **Hardware (estimado)**:
  - Tags DWM1001-DEV (~R$ 160,18)
  - Anchors Skylab VDU2501 (~R$ 1.666,35)

---

## 📂 5. Estrutura de arquivos

```
README.md
.gitignore
/scripts/
  Patio_Challenge.txt
  Patio_Challenge.csv
  Sprint_IOT.ipynb
  Scripts_SQL.sql
/API_SPRINT_IOT/
  /__pycache__/
    db.cpython-321.pyc
    main.cpython-321.pyc
  db.py
  main.py
/dashboard/
  /src/
    App.js
    /pages/
      motos.js
      vagas.js
      PatioMap.js
    /services/
      api.js
```

---

## 6. Rotas da API e parâmetros

A API foi desenvolvida em FastAPI e expõe as seguintes rotas para integração com o dashboard e automações:

### **GET /**

- Teste de funcionamento da API
- **Retorno:** `{ "status": "API funcionando 🚀" }`

### **GET /motos**

- Lista todas as motos cadastradas
- **Retorno:**
  ```json
  [
    { "id_moto": 1, "tag_id": "TAG_001", "placa": "ABC1234" },
    ...
  ]
  ```

### **POST /motos**

- Cadastra uma nova moto
- **Body:**
  ```json
  { "placa": "ABC1234" }
  ```
- **Retorno:**  
  `{ "msg": "Moto cadastrada com sucesso" }`

### **PUT /motos/{id_moto}/mover**

- Move uma moto para outra vaga
- **Parâmetros:**
  - `id_moto` (path): ID da moto
- **Body:**
  ```json
  { "id_vaga": 5 }
  ```
- **Retorno:**  
  `{ "msg": "Moto {id_moto} movida para a vaga {id_vaga}" }`

### **DELETE /motos/{id_moto}**

- Remove uma moto do sistema e libera a vaga
- **Parâmetros:**
  - `id_moto` (path): ID da moto
- **Retorno:**  
  `{ "msg": "Moto {id_moto} removida com sucesso da vaga {id_vaga}" }`

### **GET /vagas**

- Lista todas as vagas do pátio
- **Retorno:**
  ```json
  [
    { "id_vaga": 1, "codigo": "A01", "x_coord": 2, "y_coord": 3 },
    ...
  ]
  ```

### **GET /ocupacao**

- Lista as vagas ocupadas e detalhes das motos
- **Retorno:**
  ```json
  [
    {
      "id_vaga": 1,
      "codigo": "A01",
      "x_coord": 2,
      "y_coord": 3,
      "altura": 2.0,
      "largura": 1.0,
      "placa": "ABC1234",
      "tag_id": "TAG_001",
      "dt_ocupacao": "30/09/2025 14:23:00"
    },
    ...
  ]
  ```

### **POST /ocupacao**

- Estaciona uma moto em uma vaga
- **Body:**
  ```json
  { "id_vaga": 1, "id_moto": 2 }
  ```
- **Retorno:**  
  `{ "msg": "Moto estacionada com sucesso" }`  
  ou  
  `{ "msg": "Moto já está ocupando uma vaga" }`

### **GET /anchors**

- Lista todos os anchors do pátio
- **Retorno:**
  ```json
  [
    { "id_anchor": 1, "codigo": "A1", "x_coord": 0, "y_coord": 0 },
    ...
  ]
  ```

### **GET /historico**

- Lista o histórico de eventos (entrada, saída, mudança de vaga)
- **Retorno:**
  ```json
  [
    {
      "id_evento": 1,
      "id_moto": 2,
      "codigo": "A01",
      "acao": "ENTRADA",
      "dt_evento": "30/09/2025 14:23:00",
      "placa": "ABC1234"
    },
    ...
  ]
  ```

---

## 📑 7. Esquema do CSV

- `tag_id` — ID da moto/tag
- `timestamp` — hora da leitura
- `anchor_id` — ID do anchor
- `tof_ns` — tempo de captação
- `distance_m` — distância em metros
- `pos_x`, `pos_y` — posição estimada
- `pos_confidence_pct` — confiança na posição
- `status` — se a moto está parada ou andando

---

## 🚀 8. Instruções de uso

### 1. Executar a API

- Certifique-se de que o banco de dados está configurado e acessível.
- Execute o arquivo principal da API:
- A API estará disponível em `https://motosync-iot.onrender.com`.

### 2. Testar as rotas da API

- Utilize o **Postman** ou qualquer cliente HTTP para realizar requisições.
- Exemplos:
  - `GET https://motosync-iot.onrender.com/motos` — lista motos cadastradas.
  - `POST https://motosync-iot.onrender.com/motos` — cadastra uma moto (body: `{ "placa": "ABC1234" }`).
  - `PUT https://motosync-iot.onrender.com/motos/{id_moto}/mover` — move moto para outra vaga.
  - `DELETE https://motosync-iot.onrender.com/motos/{id_moto}` — retira essa moto da vaga que está.
  - `GET https://motosync-iot.onrender.com/vagas` — lista vagas.
  - `GET https://motosync-iot.onrender.com/ocupacao` — lista ocupações.
  - `POST https://motosync-iot.onrender.com/ocupacao` — adiciona uma ocupação passando vaga e moto.
  - `GET https://motosync-iot.onrender.com/historico` — lista histórico de eventos.
  - `GET https://motosync-iot.onrender.com/anchors` — lista os anchors do pátio.

### 3. Visualizar no dashboard web

- Acesse a pasta do dashboard:
  ```bash
  cd dashboard
  ```
- Instale as dependências:
  ```bash
  npm install
  ```
- Inicie a aplicação web:
  ```bash
  npm start
  ```
- Abra o navegador e acesse `http://localhost:3000` para visualizar o mapa do pátio, ocupações, histórico e métricas em tempo real.

---

## 📏 9. Regras de negócio

- Confirmação de ocupação: 15s parado.
- Mínimo de anchors: 3 por tag.
- Confiança mínima: ≥ 80%.
- Raio de associação vaga-tag: ≤ 0,41 m do centro.

---

## 📊 10. Métricas monitoradas

- Accuracy / Precision / Recall da detecção de ocupação.
- Latência de confirmação (média e p95).
- Distribuição da confiança posicional.
- Taxa de conflitos (2 motos na mesma vaga).
- Robustez com perda de anchors.

---

## 💰 11. Análise financeira

### Premissas

- 142 pátios, 100.000 motos.
- 6 anchors/pátio.
- Tags DWM1001-DEV (R$ 160,18).
- Anchors Skylab VDU2501 (R$ 1.666,35).

### Totais

- Tags (100.000): R$ 16.018.000
- Anchors (852): R$ 1.419.730,20
- Edge servers (142): R$ 1.136.000
- Infra (switch, cabeamento, instalação, postes): ~R$ 916.000
- Desenvolvimento & software: R$ 23.500
- Contingência 10%: R$ 1.952.753
- CAPEX total: R$ 21.480.283

### OPEX

- ~R$ 190.000/mês (manutenção + cloud).

### Ganhos

- Produtividade +25% = R$ 443.750/mês (economia).
- Ganho líquido = 443.750 − 190.000 = R$ 253.750/mês.

### Payback

- 21.480.283 ÷ 253.750 = ~84,6 meses (≈ 7 anos).

---

## ⚠️ 12. Riscos e mitigação

- Sensibilidade a obstáculos metálicos → instalar anchors em posições elevadas.
- Custo/logística das tags → prever plano de manutenção.
- Falsos positivos/negativos → filtros (15s, acelerômetro, redundância).
- Privacidade → anonimizar dados e definir tempo de retenção.

---

## 🔮 13. Extensões futuras

- Visão computacional (YOLO/MediaPipe) para validação.
- Dashboard interativo (web ou PowerBI).
- Alertas em tempo real (Slack/Email).
- Simulação de falha de anchors em relatórios técnicos.

---

## 📌 14. Resultados parciais do protótipo

- Dataset gerado: 20 motos ocupando vagas, 6 anchors.
- Visualização funcional: pátio com vagas (A01...), motos (pontos), vagas livres/vermelhas.
- Ocupação exportada: CSV apenas com vagas ocupadas.
- Métricas preliminares: sistema robusto com 3 anchors e 15s de confirmação.

---

## ✅ 15. Conclusão

O protótipo mostra a viabilidade técnica e a lógica de negócio para monitoramento IoT em pátios.
Embora o payback seja relativamente longo (~7 anos), há espaço para otimização com compra em volume, ajustes operacionais e inclusão de outras tecnologias de suporte (como visão computacional).

### Este projeto já permite:

- Visualizar ocupação em tempo real.
- Exportar métricas quantitativas.


