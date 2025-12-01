# Habitz WhatsApp - Foquinha
## Instruções de Configuração

---

## Passo 1: Executar SQL no Supabase

1. Acesse o **Supabase Dashboard** > **SQL Editor**
2. Execute o conteúdo do arquivo `01_add_phone_column.sql`
3. Vincule seu número de teste:

```sql
-- Substitua pelo user_id real e seu número de WhatsApp
UPDATE profiles
SET phone = '5511999999999'
WHERE user_id = 'seu-user-id-aqui';
```

**Formato do número**: código país + DDD + número (sem espaços ou caracteres)
- Exemplo Brasil: `5511987654321`

---

## Passo 2: Importar Workflow no N8N

1. Abra o **N8N**
2. Clique em **Import from File**
3. Selecione `02_habitz_whatsapp_workflow.json` (versão corrigida)
4. O workflow será importado com o nome "Habitz WhatsApp - Foquinha"

> **Nota**: O arquivo JSON foi corrigido para resolver o erro de import. Se ainda encontrar problemas, veja `04_importar_manualmente.md` para criação manual passo a passo.

---

## Passo 3: Configurar Credenciais

### 3.1 WhatsApp Trigger API
No node **WhatsApp Trigger**:
1. Clique no node
2. Em "Credential to connect with", selecione sua credencial WhatsApp OAuth
3. Se não tiver, crie uma nova seguindo a documentação do N8N

### 3.2 WhatsApp Business API (Send)
No node **Send WhatsApp Response**:
1. Configure a credencial WhatsApp API
2. Atualize o **Phone Number ID** com o ID do seu número do WhatsApp Business

### 3.3 Postgres (Supabase)
Em TODOS os nodes Postgres (são 6):
- Get User by Phone
- Get User Habits
- Complete Habit
- Create Habit
- Edit Habit
- Deactivate Habit

Configure:
- **Host**: seu-projeto.supabase.co
- **Database**: postgres
- **User**: postgres
- **Password**: sua senha do Supabase
- **Port**: 5432
- **SSL**: Require

### 3.4 OpenAI API Key
No node **Call OpenAI API**:
1. Abra o código JavaScript
2. Substitua `sk-proj-COLE_SUA_API_KEY_AQUI` pela sua API key real

---

## Passo 4: Configurar Webhook

1. Ative o workflow
2. Copie a URL do webhook do node **WhatsApp Trigger**
3. Configure essa URL no **Meta Developer Portal**:
   - Acesse developers.facebook.com
   - Vá em seu App > WhatsApp > Configuration
   - Configure o Webhook URL com a URL copiada
   - Selecione "messages" em Webhook Fields

---

## Passo 5: Testar

### Teste 1: Usuário não encontrado
Envie uma mensagem de um número não cadastrado.
**Esperado**: Mensagem de "número não vinculado"

### Teste 2: Listagem de hábitos
Envie: "quais são meus hábitos?"
**Esperado**: Lista dos hábitos cadastrados

### Teste 3: Completar hábito
Envie: "fiz meditação" (ou nome de um hábito seu)
**Esperado**: Confirmação de conclusão

### Teste 4: Criar hábito
Envie: "quero criar o hábito de ler 30 minutos de manhã"
**Esperado**: Confirmação de criação

### Teste 5: Desativar hábito
Envie: "quero desativar o hábito de ler"
**Esperado**: Confirmação de desativação

---

## Troubleshooting

### Erro: "OPENAI_API_KEY não configurada"
- Edite o node "Call OpenAI API" e insira sua API key

### Erro: "Usuário não encontrado" mesmo com número cadastrado
- Verifique o formato do número (sem espaços, com código do país)
- Confira se o campo `phone` foi preenchido na tabela `profiles`

### Erro de conexão com Postgres
- Verifique as credenciais do Supabase
- Certifique-se que SSL está habilitado

### Webhook não recebe mensagens
- Verifique se o workflow está ativo
- Confirme a URL do webhook no Meta Developer Portal
- Teste com o recurso de teste do próprio N8N

---

## Estrutura dos Nodes

```
WhatsApp Trigger
    ↓
Extract Data
    ↓
Get User by Phone
    ↓
User Exists?
    ├── YES → Get User Habits → Prepare Context → Call OpenAI → Parse Response
    │                                                              ↓
    │                                                    Route by Intent
    │                                                    /  |  |  |  |  \
    │                                                   ↓   ↓  ↓  ↓  ↓   ↓
    │                                          complete create edit deact list normal
    │                                                   \   |  |  |  |   /
    │                                                    ↓  ↓  ↓  ↓  ↓  ↓
    └── NO → User Not Found Response ───────────────→ Merge Results
                                                           ↓
                                                  Send WhatsApp Response
```

---

## Comandos Suportados (Linguagem Natural)

O Foquinha entende comandos em linguagem natural:

| Intenção | Exemplos |
|----------|----------|
| Listar hábitos | "quais são meus hábitos?", "mostra meus hábitos", "o que tenho pra fazer hoje?" |
| Completar | "fiz meditação", "concluí leitura", "terminei exercício" |
| Criar | "quero criar o hábito de correr de manhã", "adiciona meditar à noite" |
| Editar | "muda o horário de meditação pra tarde", "renomeia leitura para ler 1 hora" |
| Desativar | "desativa o hábito de correr", "remove meditação", "para de me cobrar leitura" |

---

## Custos Estimados

- **OpenAI GPT-4o**: ~$0.01 por interação (500 tokens médios)
- **WhatsApp Business API**: Conforme plano Meta (primeiras 1000 conversas/mês grátis)
- **Supabase**: Plano Free suporta o tráfego inicial

---

## Próximos Passos (Melhorias Futuras)

- [ ] Adicionar lembretes programados (cron jobs)
- [ ] Histórico de conversas para contexto
- [ ] Relatório semanal de progresso
- [ ] Vinculação automática via código no app
