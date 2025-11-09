from fastapi import FastAPI , Request
import json
from fastapi.middleware.cors import CORSMiddleware
from db import get_connection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # pode trocar para ["http://localhost:3000", "https://seu-frontend.com"] em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rota de teste
@app.get("/")
def home():
    return {"status": "API funcionando 🚀"}

# Listar motos
@app.get("/motos")
def listar_motos():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id_moto, tag_id, placa FROM tabela_moto")
        rows = cursor.fetchall()
        result = [{"id_moto": r[0], "tag_id": r[1], "placa":r[2]} for r in rows]
    return result


@app.post("/leitura")
async def receber_leitura(req: Request):
    data = await req.json()
    tag_id = data.get("tag_id")
    # validar formato mínimo
    if not tag_id or "anchors" not in data:
        return {"error":"payload inválido"}, 400

    payload_str = json.dumps(data)
    with get_connection() as conn:
        cursor = conn.cursor()
        # Oracle: usar CLOB ou bind; Postgres: jsonb
        cursor.execute(
            "INSERT INTO tabela_leitura_uwb (tag_id, payload_json, processed, dt_recebimento) VALUES (:tag_id, :payload, 'N', SYSDATE)",
            {"tag_id": tag_id, "payload": payload_str}
        )
        conn.commit()

    return {"msg":"ok"}


# Cadastrar moto
@app.post("/motos")
def cadastrar_moto(dados: dict):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO tabela_moto (id_moto, tag_id, placa)
            VALUES (
                MOTO_SEQ.NEXTVAL,
                'TAG_' || LPAD(MOTO_SEQ.CURRVAL, 3, '0'),
                :placa
            )
            """,
            {"placa": dados["placa"]}
        )
        conn.commit()
    return {"msg": "Moto cadastrada com sucesso"}

# Cadastrar ocupação (estacionar moto)
@app.post("/ocupacao")
def ocupar_vaga(dados: dict):
    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO tabela_ocupacao (id_vaga, id_moto, dt_ocupacao)
            SELECT :id_vaga, :id_moto, SYSDATE FROM dual
            WHERE NOT EXISTS (
                SELECT 1 FROM tabela_ocupacao WHERE id_moto = :id_moto
            )
            """,
            {"id_vaga": dados["id_vaga"], "id_moto": dados["id_moto"]}
        )

        if cursor.rowcount > 0:
            cursor.execute(
                "INSERT INTO tabela_historico (id_moto, id_vaga, acao, dt_evento) VALUES (:id_moto, :id_vaga, 'ENTRADA', SYSDATE)",
                {"id_moto": dados["id_moto"], "id_vaga": dados["id_vaga"]}
            )
            conn.commit()
            return {"msg": "Moto estacionada com sucesso"}
        else:
            return {"msg": "Moto já está ocupando uma vaga"}

# Mover moto (alterar vaga)
@app.put("/motos/{id_moto}/mover")
def mover_moto(id_moto: int, dados: dict):
    id_vaga_nova = dados["id_vaga"]

    with get_connection() as conn:
        cursor = conn.cursor()

        # libera vaga antiga
        cursor.execute("""
            DELETE FROM tabela_ocupacao WHERE id_moto = :id_moto
        """, {"id_moto": id_moto})

        # ocupa a nova vaga
        cursor.execute("""
            INSERT INTO tabela_ocupacao (id_vaga, id_moto, dt_ocupacao)
            VALUES (:id_vaga, :id_moto, SYSDATE)
        """, {"id_vaga": id_vaga_nova, "id_moto": id_moto})

        # registra histórico
        cursor.execute("""
            INSERT INTO tabela_historico (id_moto, id_vaga, acao, dt_evento)
            VALUES (:id_moto, :id_vaga, 'MUDANCA',  SYSDATE)
        """, {"id_moto": id_moto, "id_vaga": id_vaga_nova})

        conn.commit()

    return {"msg": f"Moto {id_moto} movida para a vaga {id_vaga_nova}"}

# Deletar moto
@app.delete("/motos/{id_moto}")
def deletar_moto(id_moto: int):
    with get_connection() as conn:
        cursor = conn.cursor()

        # 1. Buscar a vaga onde a moto está
        cursor.execute("""
            SELECT id_vaga 
            FROM tabela_ocupacao 
            WHERE id_moto = :id_moto
        """, {"id_moto": id_moto})
        row = cursor.fetchone()
        id_vaga = row[0] if row else None

        if not id_vaga:
            return {"erro": f"Moto {id_moto} não encontrada em nenhuma vaga"}

        # 2. Remover ocupação vinculada
        cursor.execute("""
            DELETE FROM tabela_ocupacao 
            WHERE id_moto = :id_moto
        """, {"id_moto": id_moto})

        # 3. Registrar saída no histórico com vaga correta
        cursor.execute("""
            INSERT INTO tabela_historico (id_moto, id_vaga, acao, dt_evento)
            VALUES (:id_moto, :id_vaga, 'SAIDA', SYSDATE)
        """, {"id_moto": id_moto, "id_vaga": id_vaga})

        conn.commit()

    return {"msg": f"Moto {id_moto} removida com sucesso da vaga {id_vaga}"}


# Listar vagas
@app.get("/vagas")
def listar_vagas():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id_vaga, codigo, x_coord, y_coord FROM tabela_vaga")
        rows = cursor.fetchall()
        result = [{"id_vaga": r[0], "codigo": r[1], "x_coord": r[2], "y_coord": r[3]} for r in rows]
    return result

# Listar ocupação
@app.get("/ocupacao")
def listar_ocupacao():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                v.id_vaga,
                v.codigo,
                v.x_coord,
                v.y_coord,
                v.altura,
                v.largura,
                m.placa,
                m.tag_id,
                TO_CHAR(o.dt_ocupacao, 'DD/MM/YYYY HH24:MI:SS') as dt_ocupacao
            FROM TABELA_VAGA v
            INNER JOIN TABELA_OCUPACAO o ON v.id_vaga = o.id_vaga
            INNER JOIN TABELA_MOTO m ON o.id_moto = m.id_moto
        """)
        rows = cursor.fetchall()
        result = [
            {
                "id_vaga": r[0],
                "codigo": r[1],
                "x_coord": r[2],
                "y_coord": r[3],
                "altura": r[4],
                "largura": r[5],
                "placa": r[6],
                "tag_id": r[7],
                "dt_ocupacao": r[8]
            }
            for r in rows
        ]
    return result

@app.post("/ocupacao/saida")
def liberar_vaga(dados: dict):
    id_moto = dados["id_moto"]
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id_vaga FROM tabela_ocupacao WHERE id_moto = :id_moto", {"id_moto": id_moto})
        row = cursor.fetchone()
        if not row:
            return {"msg":"Moto não está em nenhuma vaga"}
        id_vaga = row[0]
        cursor.execute("DELETE FROM tabela_ocupacao WHERE id_moto = :id_moto", {"id_moto": id_moto})
        cursor.execute("INSERT INTO tabela_historico (id_moto, id_vaga, acao, dt_evento) VALUES (:id_moto, :id_vaga, 'SAIDA', SYSDATE)", {"id_moto": id_moto, "id_vaga": id_vaga})
        conn.commit()
    return {"msg":"Saída registrada com sucesso", "id_vaga": id_vaga}



# Listar anchors
@app.get("/anchors")
def listar_anchors():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id_anchor, codigo, x_coord, y_coord FROM tabela_anchor")
        rows = cursor.fetchall()
        result = [{"id_anchor": r[0], "codigo": r[1], "x_coord": r[2], "y_coord": r[3]} for r in rows]
    return result

# Listar histórico
@app.get("/historico")
def listar_historico():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                h.id_evento,
                h.id_moto,
                v.codigo,
                h.acao,
                TO_CHAR(h.dt_evento, 'DD/MM/YYYY HH24:MI:SS') as dt_evento,
                m.placa
            FROM tabela_historico h
            LEFT JOIN tabela_moto m ON h.id_moto = m.id_moto
            LEFT JOIN tabela_vaga v ON h.id_vaga = v.id_vaga
            ORDER BY h.dt_evento DESC
        """)
        rows = cursor.fetchall()
        result = [
            {
                "id_evento": r[0],
                "id_moto": r[1],
                "codigo": r[2],
                "acao": r[3],
                "dt_evento": r[4],
                "placa": r[5]
            }
            for r in rows
        ]
    return result