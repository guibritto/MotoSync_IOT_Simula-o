# Mottu SmartPark (Protótipo IoT / RTLS UWB)

## 📌 1. Resumo do projeto
**Mottu SmartPark** é um protótipo simulado de sistema de localização de motos em pátios usando **UWB (Ultra-Wideband)**.  
O objetivo é **monitorar em tempo real a posição das motos**, identificar se estão corretamente alocadas em suas vagas (`A01`, `A02`...), gerar métricas de confiabilidade e apoiar a operação da Mottu em escala nacional.  

O protótipo simula **leitura, tratamento e visualização de dados IoT**:  
- Geração de dataset sintético (CSV com leituras ToF/distâncias);  
- Trilateração para calcular posições `(x, y)`;  
- Mapeamento das motos em vagas;  
- Regras de ocupação (janela de 15s);  
- Visualização do pátio (matplotlib);  
- Estimativa financeira (CAPEX, OPEX e payback).  

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

## 🖥️ 4. Tecnologias utilizadas
- **Python 3.12**  
- Bibliotecas:  
  - `numpy`, `pandas`, `matplotlib`, `scipy`  
  - `scikit-learn` ou `lightgbm` (para ML opcional)  
- **Banco de dados**: PostgreSQL / TimescaleDB (sugerido).  
- **Mensageria (simulada)**: MQTT para ingestão.  
- **Hardware (estimado)**:  
  - Tags DWM1001-DEV (~R$ 160,18)  
  - Anchors Skylab VDU2501 (~R$ 1.666,35)  

---

## 📂 5. Estrutura de arquivos

```
/README.md
/scripts/
Sprint_IOT.ipynb
Patio_Challenge.txt
Patio_Challenge.csv
/docs/
```

---

## 📑 6. Esquema do CSV
- `timestamp` — hora da leitura  
- `tag_id` — ID da moto/tag  
- `anchor_id` — ID do anchor
- `tof_ns` — tempo de captação
- `distance_m` — distância em metros  
- `pos_x`, `pos_y` — posição estimada  
- `slot_id` — vaga atribuída (quando ocupada)  
- `pos_confidence_pct` — confiança na posição
- `status` — se a moto está parada ou andando

---

## 🚀 7. Instruções de uso

1. Abrir o arquivo "Sprint_IOT.ipynb" em alguma IDE
2. Rodar o código até a seguinte parte:
3. Escrever a posição da sua própria moto
4. Rodar a visualização do gráfico

---

## 📏 8. Regras de negócio

- Confirmação de ocupação: 15s parado.
- Mínimo de anchors: 3 por tag.
- Confiança mínima: ≥ 80%.
- Raio de associação vaga-tag: ≤ 0,41 m do centro.

---

## 📊 9. Métricas monitoradas

- Accuracy / Precision / Recall da detecção de ocupação.
- Latência de confirmação (média e p95).
- Distribuição da confiança posicional.
- Taxa de conflitos (2 motos na mesma vaga).
- Robustez com perda de anchors.

---

## 💰 10. Análise financeira
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

## ⚠️ 11. Riscos e mitigação

- Sensibilidade a obstáculos metálicos → instalar anchors em posições elevadas.
- Custo/logística das tags → prever plano de manutenção.
- Falsos positivos/negativos → filtros (15s, acelerômetro, redundância).
- Privacidade → anonimizar dados e definir tempo de retenção.

---

## 🔮 12. Extensões futuras

- Visão computacional (YOLO/MediaPipe) para validação.
- Dashboard interativo (web ou PowerBI).
- Alertas em tempo real (Slack/Email).
- Simulação de falha de anchors em relatórios técnicos.

---

## 📌 13. Resultados parciais do protótipo

- Dataset gerado: 20 motos ocupando vagas, 6 anchors.
- Visualização funcional: pátio com vagas (A01...), motos (pontos), vagas livres/vermelhas.
- Ocupação exportada: CSV apenas com vagas ocupadas.
- Métricas preliminares: sistema robusto com 3 anchors e 15s de confirmação.

---

## ✅ 14. Conclusão

O protótipo mostra a viabilidade técnica e a lógica de negócio para monitoramento IoT em pátios.
Embora o payback seja relativamente longo (~7 anos), há espaço para otimização com compra em volume, ajustes operacionais e inclusão de outras tecnologias de suporte (como visão computacional).

### Este projeto já permite:

- Visualizar ocupação em tempo real.
- Exportar métricas quantitativas.
