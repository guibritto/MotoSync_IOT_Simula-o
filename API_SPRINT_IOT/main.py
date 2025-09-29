from fastapi import FastAPI
from db import get_connection

app = FastAPI()

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
        result = [{"id_moto": r[0], "tag_id": r[1]} for r in rows]
    return result

# Cadastrar moto
@app.post("/motos")
def cadastrar_moto(dados: dict):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO tabela_moto (id_moto, tag_id, placa) VALUES (MOTO_SEQ.NEXTVAL, :placa)",
            {"placa": dados["placa"]}
        )
        conn.commit()
    return {"msg": "Moto cadastrada com sucesso"}

# Cadastrar ocupação (estacionar moto)
@app.post("/ocupacao")
def ocupar_vaga(dados: dict):
    with get_connection() as conn:
        cursor = conn.cursor()

        # coloca a moto na vaga caso moto não esteja ocupando nenhuma
        cursor.execute(
            "INSERT INTO tabela_ocupacao (id_vaga, id_moto, dt_ocupacao) VALUES (:id_vaga, :id_moto, SYSDATE)",
            {"id_vaga": dados["id_vaga"], "id_moto": dados["id_moto"]}
        )

        # registra histórico
        cursor.execute(
            "INSERT INTO tabela_historico (id_evento, id_moto, id_vaga, acao, dt_evento) VALUES (HIST_SEQ.NEXTVAL, :id_moto, :id_vaga, 'ENTRADA', SYSDATE)",
            {"id_moto": dados["id_moto"], "id_vaga": dados["id_vaga"]}
        )

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
            INSERT INTO tabela_historico (id_evento, id_moto, id_vaga, acao, dt_evento)
            VALUES (HIST_SEQ.NEXTVAL, :id_moto, :id_vaga, SYSDATE)
        """, {"id_moto": id_moto, "id_vaga": id_vaga_nova, "acao": "MUDANCA"})

        conn.commit()

    return {"msg": f"Moto {id_moto} movida para a vaga {id_vaga_nova}"}

# Deletar moto
@app.delete("/motos/{id_moto}")
def deletar_moto(id_moto: int):
    with get_connection() as conn:
        cursor = conn.cursor()

        # remove ocupação vinculada
        cursor.execute("DELETE FROM OCUPACAO WHERE id_moto = :id_moto", {"id_moto": id_moto})

        # adicionar remoção ao histórico
        cursor.execute("""
            INSERT INTO tabela_historico (id_evento, id_moto, id_vaga, acao, dt_evento)
            VALUES (HIST_SEQ.NEXTVAL, :id_moto, NULL, 'SAIDA', SYSDATE)
        """, {"id_moto": id_moto})


    return {"msg": f"Moto {id_moto} removida com sucesso"}

# Listar vagas
@app.get("/vagas")
def listar_vagas():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id_vaga, codigo FROM tabela_vaga")
        rows = cursor.fetchall()
        result = [{"id_vaga": r[0], "codigo": r[1]} for r in rows]
    return result

# Listar ocupação
@app.get("/ocupacao")
def listar_ocupacao():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT v.codigo_vaga, v.setor, m.placa, m.modelo
            FROM VAGA v
            LEFT JOIN OCUPACAO o ON v.id_vaga = o.id_vaga
            LEFT JOIN MOTO m ON o.id_moto = m.id_moto
        """)
        rows = cursor.fetchall()
        return [
            {"vaga": r[0], "setor": r[1], "placa": r[2], "modelo": r[3]} for r in rows
        ]


# Listar anchors
@app.get("/anchors")
def listar_anchors():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id_anchor, codigo, x_coord, y_coord FROM tabela_anchor")
        rows = cursor.fetchall()
        result = [{"id_anchor": r[0], "codigo": r[1], "x_coord": r[2], "y_coord": r[3]} for r in rows]
    return result
