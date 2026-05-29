# Preenchimento de Dados - Franqueados J&T

Site Flask para Preenchimento de Dados - Franqueados J&T, com tela admin protegida, upload de anexos e persistência opcional em GitHub + Cloudflare R2.

## O que vem pronto

- Formulário com todos os campos solicitados, organizado em etapas:
  - Informações básicas
  - Responsável Financeiro
  - Responsável pela Franquia
  - Criação de Feishu
  - Dados Bancários
  - Anexos obrigatórios: Cartão CNPJ, Cartão Social / CCMEI e Comprovante Sintegra
- Tela admin com login e senha.
- Listagem por dia/mês/ano, mantendo ordem de preenchimento dentro de cada data.
- Visualização detalhada de cada cadastro.
- Upload local por padrão.
- Integração opcional com GitHub para salvar JSON dos cadastros.
- Integração opcional com Cloudflare R2 para armazenar anexos.
- Pronto para Render com `Procfile` e `render.yaml`.

## Como rodar localmente

```bash
cd jt-cadastro-fornecedores
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Acesse:

```text
http://127.0.0.1:5000
```

Painel admin:

```text
http://127.0.0.1:5000/admin
```

Login padrão local:

```text
Usuário: luiz_miranda
Senha: admin123
```

## Variáveis de ambiente

Copie `.env.example` para `.env` se quiser usar localmente com python-dotenv, ou configure direto no Render.

### Admin

```env
SECRET_KEY=troque-por-uma-chave-grande-e-segura
ADMIN_USERNAME=luiz_miranda
ADMIN_PASSWORD=admin123
```

Em produção, recomendo usar hash de senha:

```bash
flask --app app generate-admin-hash sua-senha-forte
```

Depois configure no Render:

```env
ADMIN_PASSWORD_HASH=scrypt:...
```

E remova `ADMIN_PASSWORD`.

## GitHub para salvar os cadastros

O sistema sempre salva localmente. Se você configurar GitHub, ele também envia cada cadastro como JSON para:

```text
data/submissions/ANO/MES/DIA/id.json
```

Variáveis necessárias:

```env
GITHUB_TOKEN=ghp_seu_token_aqui
GITHUB_REPO=usuario/repositorio
GITHUB_BRANCH=main
```

Permissões mínimas do token: acesso de escrita ao repositório onde os JSON serão salvos.

## Cloudflare R2 para anexos

Se configurado, os anexos Cartão CNPJ, Cartão Social / CCMEI e Comprovante Sintegra serão enviados para o bucket R2.

Variáveis necessárias:

```env
CLOUDFLARE_R2_ACCOUNT_ID=seu_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=sua_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=sua_secret_key
CLOUDFLARE_R2_BUCKET=nome_do_bucket
CLOUDFLARE_R2_PUBLIC_URL=https://arquivos.seudominio.com
```

`CLOUDFLARE_R2_PUBLIC_URL` é opcional. Sem ela, o cadastro continua salvo, mas o painel admin não terá um link público direto para abrir o anexo.

## Deploy no Render

1. Crie um repositório no GitHub.
2. Suba os arquivos deste projeto.
3. No Render, crie um novo Web Service apontando para o repositório.
4. Build command:

```bash
pip install -r requirements.txt
```

5. Start command:

```bash
gunicorn wsgi:app
```

6. Configure as variáveis de ambiente no Render.

## Observação importante sobre armazenamento

O filesystem do Render pode ser reiniciado. Para produção, use GitHub para os JSON e Cloudflare R2 para os anexos. O modo local é ótimo para teste, mas não deve ser a única fonte persistente em produção.

## Guia de deploy

Veja o arquivo `DEPLOY.md` para o passo a passo de GitHub, Render e Cloudflare.
