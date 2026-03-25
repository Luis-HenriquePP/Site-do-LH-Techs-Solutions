import os
import re
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, render_template, g
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
import psycopg2.extras

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configurações de ambiente
DATABASE_URL = os.getenv("DATABASE_URL")
DEBUG_MODE = os.getenv("FLASK_DEBUG", "False").lower() == "true"

app.config["DEBUG"] = DEBUG_MODE

# ─── Conexão com banco de dados ───────────────────────────────────────────────

def get_db():
    if DATABASE_URL:
        if 'db_conn' not in g:
            g.db_conn = psycopg2.connect(DATABASE_URL)
            g.db_conn.row_factory = psycopg2.extras.DictCursor
        return g.db_conn
    else:
        if 'db_sqlite' not in g:
            db_path = os.path.join(os.path.dirname(__file__), 'database.db')
            g.db_sqlite = sqlite3.connect(db_path)
            g.db_sqlite.row_factory = sqlite3.Row
        return g.db_sqlite

def get_cursor():
    db = get_db()
    if DATABASE_URL:
        return db.cursor(cursor_factory=psycopg2.extras.DictCursor)
    else:
        return db.cursor()

@app.teardown_appcontext
def close_connection(exception):
    if DATABASE_URL:
        db_conn = g.pop('db_conn', None)
        if db_conn is not None:
            db_conn.close()
    else:
        db_sqlite = g.pop('db_sqlite', None)
        if db_sqlite is not None:
            db_sqlite.close()

# ─── Inicialização do banco de dados ─────────────────────────────────────────

def init_db():
    with app.app_context():
        db = get_db()
        cursor = get_cursor()

        if DATABASE_URL:
            # PostgreSQL
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS services (
                    id          SERIAL PRIMARY KEY,
                    name        VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    price       NUMERIC(10, 2) NOT NULL,
                    icon        VARCHAR(255) DEFAULT 'fas fa-tools'
                );
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS contacts (
                    id         SERIAL PRIMARY KEY,
                    name       VARCHAR(255) NOT NULL,
                    phone      VARCHAR(255) NOT NULL,
                    message    TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
            db.commit()

            # Inserir serviços padrão se a tabela estiver vazia
            cursor.execute('SELECT COUNT(*) FROM services')
            count = cursor.fetchone()[0]
            if count == 0:
                services_default = [
                    ('Formatação e Reinstalação de SO',
                     'Formatação completa do sistema operacional com instalação de drivers, programas essenciais e configuração personalizada.',
                     150.00, 'fas fa-desktop'),
                    ('Remoção de Vírus e Malware',
                     'Limpeza profunda do sistema, remoção de vírus, spyware, adware e outros softwares maliciosos com proteção preventiva.',
                     120.00, 'fas fa-shield-alt'),
                    ('Manutenção Preventiva',
                     'Limpeza interna de hardware, troca de pasta térmica, verificação de componentes e otimização geral do desempenho.',
                     100.00, 'fas fa-wrench'),
                    ('Upgrade de Hardware',
                     'Instalação e configuração de novos componentes: memória RAM, SSD, placa de vídeo e outros upgrades para melhorar o desempenho.',
                     80.00, 'fas fa-microchip'),
                    ('Recuperação de Dados',
                     'Recuperação de arquivos perdidos por falha no HD/SSD, formatação acidental ou corrupção de dados com alta taxa de sucesso.',
                     200.00, 'fas fa-database'),
                    ('Suporte Remoto',
                     'Atendimento técnico remoto para resolução de problemas de software, configurações e dúvidas sem necessidade de deslocamento.',
                     60.00, 'fas fa-wifi'),
                    ('Configuração de Redes',
                     'Instalação e configuração de redes Wi-Fi, cabeadas, roteadores, switches e soluções de conectividade para residências e empresas.',
                     130.00, 'fas fa-network-wired'),
                    ('Diagnóstico Técnico',
                     'Análise completa do equipamento para identificação de falhas em hardware e software com relatório detalhado e orçamento.',
                     50.00, 'fas fa-search'),
                ]
                cursor.executemany(
                    'INSERT INTO services (name, description, price, icon) VALUES (%s, %s, %s, %s)',
                    services_default
                )
                db.commit()
        else:
            # SQLite
            cursor.execute('PRAGMA foreign_keys = ON;')
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS services (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    name        TEXT NOT NULL,
                    description TEXT NOT NULL,
                    price       REAL NOT NULL,
                    icon        TEXT DEFAULT 'fas fa-tools'
                );
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS contacts (
                    id         INTEGER PRIMARY KEY AUTOINCREMENT,
                    name       TEXT NOT NULL,
                    phone      TEXT NOT NULL,
                    message    TEXT,
                    created_at TEXT NOT NULL
                );
                """
            )
            db.commit()

            # Inserir serviços padrão se a tabela estiver vazia
            cursor.execute('SELECT COUNT(*) FROM services')
            count = cursor.fetchone()[0]
            if count == 0:
                services_default = [
                    ('Formatação e Reinstalação de SO',
                     'Formatação completa do sistema operacional com instalação de drivers, programas essenciais e configuração personalizada.',
                     150.00, 'fas fa-desktop'),
                    ('Remoção de Vírus e Malware',
                     'Limpeza profunda do sistema, remoção de vírus, spyware, adware e outros softwares maliciosos com proteção preventiva.',
                     120.00, 'fas fa-shield-alt'),
                    ('Manutenção Preventiva',
                     'Limpeza interna de hardware, troca de pasta térmica, verificação de componentes e otimização geral do desempenho.',
                     100.00, 'fas fa-wrench'),
                    ('Upgrade de Hardware',
                     'Instalação e configuração de novos componentes: memória RAM, SSD, placa de vídeo e outros upgrades para melhorar o desempenho.',
                     80.00, 'fas fa-microchip'),
                    ('Recuperação de Dados',
                     'Recuperação de arquivos perdidos por falha no HD/SSD, formatação acidental ou corrupção de dados com alta taxa de sucesso.',
                     200.00, 'fas fa-database'),
                    ('Suporte Remoto',
                     'Atendimento técnico remoto para resolução de problemas de software, configurações e dúvidas sem necessidade de deslocamento.',
                     60.00, 'fas fa-wifi'),
                    ('Configuração de Redes',
                     'Instalação e configuração de redes Wi-Fi, cabeadas, roteadores, switches e soluções de conectividade para residências e empresas.',
                     130.00, 'fas fa-network-wired'),
                    ('Diagnóstico Técnico',
                     'Análise completa do equipamento para identificação de falhas em hardware e software com relatório detalhado e orçamento.',
                     50.00, 'fas fa-search'),
                ]
                cursor.executemany(
                    'INSERT INTO services (name, description, price, icon) VALUES (?, ?, ?, ?)',
                    services_default
                )
                db.commit()


# ─── Utilitários de validação ─────────────────────────────────────────────────

def sanitize(text):
    """Remove caracteres potencialmente perigosos."""
    if not text:
        return ''
    return str(text).strip()[:1000]


def is_valid_phone(phone):
    """Valida formato de telefone brasileiro."""
    digits = re.sub(r'\D', '', phone)
    return 8 <= len(digits) <= 15


def is_spam(name, message):
    """Detecção básica de spam."""
    spam_keywords = ['http://', 'https://', 'www.', 'click here', 'buy now',
                     'free money', 'casino', 'viagra', 'lottery']
    combined = (name + ' ' + (message or '')).lower()
    return any(kw in combined for kw in spam_keywords)


# ─── Rotas ────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/services', methods=['GET'])
def get_services():
    """Retorna todos os serviços cadastrados."""
    try:
        db = get_db()
        cursor = get_cursor()
        cursor.execute('SELECT id, name, description, price, icon FROM services ORDER BY id')
        rows = cursor.fetchall()
        services = [
            {
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'price': float(row['price']),
                'price_formatted': f'R$ {float(row["price"]):.2f}'.replace('.', ','),
                'icon': row['icon'],
            }
            for row in rows
        ]
        return jsonify({'success': True, 'data': services})
    except Exception as e:
        app.logger.error(f"Erro ao buscar serviços: {e}")
        return jsonify({'success': False, 'error': 'Erro ao buscar serviços.'}), 500


@app.route('/contact', methods=['POST'])
def post_contact():
    """Recebe e salva um contato enviado pelo formulário."""
    try:
        data = request.get_json(silent=True) or request.form

        name    = sanitize(data.get('name', ''))
        phone   = sanitize(data.get('phone', ''))
        message = sanitize(data.get('message', ''))

        # Validação de campos obrigatórios
        errors = {}
        if not name or len(name) < 2:
            errors['name'] = 'Nome deve ter pelo menos 2 caracteres.'
        if not phone:
            errors['phone'] = 'Telefone é obrigatório.'
        elif not is_valid_phone(phone):
            errors['phone'] = 'Telefone inválido. Informe um número válido.'

        if errors:
            return jsonify({'success': False, 'errors': errors}), 400

        # Proteção básica contra spam
        if is_spam(name, message):
            return jsonify({'success': False, 'error': 'Mensagem identificada como spam.'}), 400

        db = get_db()
        cursor = get_cursor()

        if DATABASE_URL:
            cursor.execute(
                'INSERT INTO contacts (name, phone, message) VALUES (%s, %s, %s)',
                (name, phone, message)
            )
        else:
            created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute(
                'INSERT INTO contacts (name, phone, message, created_at) VALUES (?, ?, ?, ?)',
                (name, phone, message, created_at)
            )
        db.commit()

        return jsonify({
            'success': True,
            'message': 'Contato recebido com sucesso! Entraremos em contato em breve.'
        }), 201

    except Exception as e:
        app.logger.error(f"Erro ao processar contato: {e}")
        return jsonify({'success': False, 'error': 'Erro interno. Tente novamente.'}), 500


# ─── Inicialização ────────────────────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    app.run(debug=DEBUG_MODE, host='0.0.0.0', port=os.getenv('PORT', 5000))
