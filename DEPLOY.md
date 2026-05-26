# Deploy do projeto: GitHub + Render + Cloudflare

## 1. Login do painel

O usuário padrão do painel foi alterado para:

```text
Usuário: luiz_miranda
Senha local padrão: admin123
```

Em produção, não use senha aberta. Gere um hash e configure no Render:

```bash
flask --app app generate-admin-hash sua-senha-forte
```

Depois coloque o resultado em:

```env
ADMIN_PASSWORD_HASH=scrypt:...
```

No Render, deixe também:

```env
ADMIN_USERNAME=luiz_miranda
```

## 2. Subir para o GitHub

Na pasta do projeto:

```bash
git init
git add .
git commit -m "Deploy inicial J&T cadastro fornecedores"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/jt-cadastro-fornecedores.git
git push -u origin main
```

Troque `SEU_USUARIO` pelo usuário/organização do GitHub.

## 3. Variáveis para salvar os cadastros no GitHub

Crie um token no GitHub com permissão de escrita no repositório e configure no Render:

```env
GITHUB_TOKEN=seu_token_do_github
GITHUB_REPO=SEU_USUARIO/jt-cadastro-fornecedores
GITHUB_BRANCH=main
```

O sistema salva os JSON em:

```text
data/submissions/ANO/MES/DIA/id.json
```

## 4. Deploy no Render

O projeto já tem `render.yaml`, `Procfile` e `wsgi.py`.

No Render, use uma destas opções:

### Opção A — Blueprint

1. New > Blueprint.
2. Conecte o repositório do GitHub.
3. O Render vai ler o `render.yaml` automaticamente.
4. Preencha as variáveis marcadas como secretas.

### Opção B — Web Service manual

1. New > Web Service.
2. Conecte o repositório do GitHub.
3. Runtime: Python.
4. Build Command:

```bash
pip install -r requirements.txt
```

5. Start Command:

```bash
gunicorn wsgi:app
```

## 5. Variáveis recomendadas no Render

```env
SECRET_KEY=gere-uma-chave-grande-e-segura
APP_TIMEZONE=America/Sao_Paulo
MAX_UPLOAD_MB=20
ADMIN_USERNAME=luiz_miranda
ADMIN_PASSWORD_HASH=hash_gerado_pelo_comando
GITHUB_TOKEN=seu_token_do_github
GITHUB_REPO=SEU_USUARIO/jt-cadastro-fornecedores
GITHUB_BRANCH=main
CLOUDFLARE_R2_ACCOUNT_ID=seu_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=sua_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=sua_secret_key
CLOUDFLARE_R2_BUCKET=nome_do_bucket
CLOUDFLARE_R2_PUBLIC_URL=https://arquivos.seudominio.com
```

## 6. Cloudflare R2 para anexos

No Cloudflare:

1. Abra R2 Object Storage.
2. Crie um bucket, por exemplo: `jt-cadastro-anexos`.
3. Crie uma credencial/API token de R2 com permissão de leitura e escrita no bucket.
4. Copie:
   - Account ID
   - Access Key ID
   - Secret Access Key
   - Nome do bucket
5. Configure essas informações no Render.

## 7. Domínio no Cloudflare apontando para o Render

No Render:

1. Entre no serviço.
2. Vá em Settings > Custom Domains.
3. Adicione seu domínio ou subdomínio.
4. Copie o destino `onrender.com` informado.

No Cloudflare:

1. DNS > Records.
2. Crie um CNAME apontando para o domínio `.onrender.com` do Render.
3. Para validação inicial, deixe como DNS only.
4. Depois que o Render validar o certificado, você pode ativar o proxy se quiser.

## 8. Observação importante

O disco local do Render não deve ser usado como única fonte de produção. Este projeto já está preparado para persistir os dados no GitHub e enviar anexos para o Cloudflare R2.
