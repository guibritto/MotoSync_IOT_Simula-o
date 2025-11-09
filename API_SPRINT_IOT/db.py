import oracledb

# Configurações do banco
username = "rm558117"
password = "271298"
dsn = "oracle.fiap.com.br:1521/ORCL"  # exemplo: XE ou PDB no Oracle

# Criar pool de conexões (recomendado para API)
pool = oracledb.create_pool(
    user=username,
    password=password,
    dsn=dsn,
    min=1,
    max=5,
    increment=1
)

def get_connection():
    return pool.acquire()
