# LH Techs Solutions — Site Institucional

Site institucional moderno e responsivo para a **LH Techs Solutions**, empresa de assistência técnica de informática. Desenvolvido com Python/Flask, PostgreSQL (produção) / SQLite (desenvolvimento) e design dark mode tecnológico.

---

## Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)
- Para produção: PostgreSQL

---

## Instalação e Execução (Desenvolvimento Local)

**1. Clone ou extraia o projeto:**

```bash
cd lh-techs
```

**2. Instale as dependências:**

```bash
pip install -r requirements.txt
```

**3. Configure as variáveis de ambiente (opcional para SQLite):**

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```dotenv
FLASK_DEBUG=True
DATABASE_URL=
```

- `FLASK_DEBUG=True` ativa o modo de depuração do Flask.
- `DATABASE_URL` vazio fará com que o aplicativo use SQLite localmente.

**4. Inicie o servidor:**

```bash
python app.py
```

**5. Acesse no navegador:**

```
http://localhost:5000
```

O banco de dados SQLite (`database.db`) será criado automaticamente com os serviços padrão na primeira execução.

---

## Estrutura do Projeto

```
lh-techs/
├── app.py              # Backend Flask — rotas, API e banco de dados
├── database.db         # Banco de dados SQLite (criado automaticamente em dev)
├── requirements.txt    # Dependências do Python
├── Procfile            # Configuração para deploy em plataformas como Render/Heroku
├── .env                # Variáveis de ambiente (local)
├── README.md
├── templates/
│   └── index.html      # Template HTML principal
└── static/
    ├── css/
    │   └── style.css   # Design system completo
    ├── js/
    │   └── main.js     # JavaScript vanilla
    └── images/         # Imagens e previews
```

---

## API REST

| Método | Rota        | Descrição                         |
|--------|-------------|-----------------------------------|
| GET    | `/services` | Retorna todos os serviços         |
| POST   | `/contact`  | Recebe e salva um contato         |

### Exemplo — GET /services

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Formatação e Reinstalação de SO",
      "description": "...",
      "price": 150.0,
      "price_formatted": "R$ 150,00",
      "icon": "fas fa-desktop"
    }
  ]
}
```

### Exemplo — POST /contact

**Requisição:**
```json
{
  "name": "João Silva",
  "phone": "(11) 99999-9999",
  "message": "Preciso de uma formatação."
}
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "message": "Contato recebido com sucesso! Entraremos em contato em breve."
}
```

---

## Personalização

### Dados de contato (WhatsApp e Instagram)

Substitua os links no arquivo `templates/index.html`:

```html
<!-- Substitua 5500000000000 pelo número real com DDI+DDD+número -->
href="https://wa.me/5500000000000?text=..."

<!-- Substitua lhtechssolutions pelo @ real do Instagram -->
href="https://instagram.com/lhtechssolutions"
```

### Adicionar/editar serviços

Os serviços são gerenciados diretamente no banco de dados. Para SQLite (desenvolvimento), você pode usar qualquer cliente SQLite (ex: DB Browser for SQLite) para editar a tabela `services`. Para PostgreSQL (produção), use ferramentas apropriadas para PostgreSQL.

### Cores e design

Todas as variáveis de design estão no início do arquivo `static/css/style.css`:

```css
:root {
  --color-electric: #0A84FF;   /* Azul elétrico */
  --color-cyan:     #00E5FF;   /* Ciano */
  --color-purple:   #7B61FF;   /* Roxo */
}
```

---

## Funcionalidades

- **Header fixo** com efeito de blur ao rolar a página
- **Hero Section** com partículas animadas, gradientes tecnológicos, 3 botões de CTA e contadores animados
- **Seção Sobre** com cards de Missão, Visão e Valores
- **Serviços dinâmicos** carregados via API REST do backend
- **Diferenciais** com 4 cards destacados
- **Formulário de contato** com validação frontend e backend
- **Botão WhatsApp flutuante** sempre visível
- **Menu hambúrguer** responsivo para mobile
- **Animações de entrada** ao rolar a página (Intersection Observer)
- **Dark mode** como padrão visual

---

## Deploy para Produção

Para deploy em plataformas como Render, Railway, Heroku, etc.:

1.  **Configure a variável de ambiente `DATABASE_URL`**: Esta variável deve conter a string de conexão do seu banco de dados PostgreSQL. Exemplo:
    `DATABASE_URL=postgresql://user:password@host:port/database_name`
2.  **Configure `FLASK_DEBUG=False`**: Para desativar o modo de depuração em produção.
3.  A aplicação usará o **Gunicorn** automaticamente via `Procfile`.
4.  Certifique-se de que todas as dependências estão listadas em `requirements.txt`.

---

## Tecnologias Utilizadas

| Camada   | Tecnologia                                |
|----------|-------------------------------------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla)         |
| Backend  | Python 3, Flask, Flask-CORS, Gunicorn     |
| Banco    | SQLite (dev) / PostgreSQL (prod), Psycopg2|
| Fontes   | Inter, Poppins (Google Fonts)             |
| Ícones   | Font Awesome 6                            |

---

&copy; 2026 LH Techs Solutions. Todos os direitos reservados.
