# 🧪 Teste Rápido - Smart Goal Cards

## 🚀 Servidor
**URL:** http://localhost:8083/

✅ Migration aplicada
✅ TypeScript sem erros
✅ Vite rodando sem problemas

---

## 📋 Checklist de Teste (5 minutos)

### Teste 1: Hábito BINARY (sem meta numérica)
**Tempo:** 1 minuto

1. Acesse: http://localhost:8083/create-habit
2. Clique em **"Produtividade"**
3. Selecione **"Acordar Cedo"**

**✅ Verificar:**
- [ ] Não aparece input de meta
- [ ] Mostra card com ícone (i) verde
- [ ] Texto: "Hábito de confirmação"
- [ ] Help text: "Estabeleça um horário fixo para acordar"
- [ ] Sem botões de sugestão

---

### Teste 2: Hábito SIMPLE (com sugestões)
**Tempo:** 2 minutos

1. Volte para categorias
2. Clique em **"Produtividade"**
3. Selecione **"Meditar"**

**✅ Verificar:**
- [ ] Aparece card de meta com ícone Target
- [ ] Input mostra automaticamente **"10"**
- [ ] Label do lado direito: **"min"**
- [ ] 3 botões de sugestão: **"5 min"**, **"10 min"**, **"20 min"**
- [ ] Botão "10 min" está verde (selecionado)
- [ ] Help text com emoji 💡: "Iniciantes: 5-10 min • Intermediário..."

**🎯 Testar interação:**
- [ ] Clicar em "20 min" → input muda para 20
- [ ] Botão "20 min" fica verde
- [ ] Digitar "2" → aparece warning amarelo
- [ ] Warning: "Menos de 3 minutos pode ser desafiador..."
- [ ] Warning não bloqueia (é apenas aviso)

---

### Teste 3: Hábito ADVANCED (múltiplas unidades)
**Tempo:** 2 minutos

1. Volte para categorias
2. Clique em **"Saúde/Fitness"**
3. Selecione **"Caminhar ou Correr"**

**✅ Verificar:**
- [ ] Aparece card de meta
- [ ] 3 tabs no topo: **"passos"**, **"km"**, **"min"**
- [ ] Tab "passos" está selecionada (verde)
- [ ] Input mostra **"10000"**
- [ ] Label: **"passos"**
- [ ] 3 sugestões: **"10000 passos"**, **"8000 passos"**, **"15000 passos"**

**🎯 Testar troca de unidade:**
- [ ] Clicar em tab **"km"**
  - Input reseta para **"5"**
  - Label muda para **"km"**
  - Sugestões mudam: **"5 km"**, **"8 km"**, **"10 km"**
- [ ] Clicar em tab **"min"**
  - Input reseta para **"30"**
  - Label muda para **"min"**
  - Sugestões mudam: **"30 min"**, **"45 min"**, **"60 min"**
- [ ] Voltar para tab **"passos"**
  - Tudo volta ao estado inicial

---

### Teste 4: Criação Completa (OPCIONAL)
**Tempo:** 3 minutos

Se quiser testar o fluxo completo de criação:

1. Escolha qualquer hábito (ex: "Meditar")
2. Defina a meta (ex: 20 min)
3. Preencha título: "Meditação Diária"
4. Escolha frequência: "Todos os dias"
5. Selecione dias (use "Selecionar todos")
6. Escolha horário: Manhã
7. Clique em **"SALVAR TAREFA"**

**✅ Verificar:**
- [ ] Hábito criado com sucesso
- [ ] Sem erro de constraint de categoria
- [ ] Toast de confirmação aparece
- [ ] Redireciona para lista de hábitos

---

## 🎨 Verificação de Design

Durante os testes, verificar visualmente:

**Cores:**
- [ ] Accent verde lime (#A3E635) consistente
- [ ] Cards com fundo escuro translúcido
- [ ] Botões ativos: verde lime, texto preto
- [ ] Botões inativos: branco translúcido
- [ ] Warnings: amarelo, não bloqueantes

**Transições:**
- [ ] Animações suaves ao trocar tabs
- [ ] Hover nos botões funciona
- [ ] Feedback visual ao clicar

**Responsividade:**
- [ ] Grid de 3 colunas para sugestões
- [ ] Text labels alinhados corretamente
- [ ] Mobile-friendly (se testar em celular)

---

## 🐛 Problemas Conhecidos

Se encontrar erros, verificar:

1. **Erro de categoria:** Migration já foi aplicada ✅
2. **Componente não carrega:** Verificar console do navegador (F12)
3. **Sugestões não aparecem:** Verificar habitId no habit-goal-configs.ts

---

## ✅ Resultado Esperado

Após os testes:
- [ ] Todos os 3 tipos de cards funcionam
- [ ] Interações responsivas e suaves
- [ ] Validações não-bloqueantes funcionais
- [ ] Design consistente e polido

Se todos os checkboxes estiverem marcados:
🎉 **SISTEMA VALIDADO E PRONTO PARA DEPLOY!**

---

## 📊 Relatório Rápido

Após testar, preencher:

**Binary Card:** ✅ / ❌
**Simple Card:** ✅ / ❌
**Advanced Card:** ✅ / ❌
**Criação completa:** ✅ / ❌
**Design:** ✅ / ❌

**Problemas encontrados:**
```
(listar aqui se houver)
```

---

**Tempo total estimado:** 5-10 minutos
**Data do teste:** ___________
**Testado por:** ___________
