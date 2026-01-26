# 🎮 Gamification Components

Sistema completo de gamificação estilo Duolingo para Habitz. Inclui moeda virtual (Gems), avatares desbloqueáveis, achievements, e streak freezes.

---

## 📦 Componentes

### 1. **GemCounter** `GemCounter.tsx`
Display do saldo atual de gems com botão interativo.

```tsx
import { GemCounter } from '@/components/gamification/GemCounter';

// Uso
<GemCounter
  userId={user.id}
  size="md"  // sm | md | lg
  onClick={() => setAvatarShopOpen(true)}
/>
```

**Features:**
- Exibe saldo em tempo real
- 3 tamanhos disponíveis
- Animação de hover/tap
- Cor roxa (tema gems)

---

### 2. **AvatarShopModal** `AvatarShopModal.tsx`
Modal para compra/gerenciamento de avatares com 3 abas (todos, desbloqueados, bloqueados).

```tsx
import { AvatarShopModal } from '@/components/gamification/AvatarShopModal';

// Uso
const [open, setOpen] = useState(false);
<AvatarShopModal
  isOpen={open}
  onClose={() => setOpen(false)}
  userId={user.id}
/>
```

**Features:**
- Grid de 20 avatares em 4 tiers
- Filtro por abas
- Compra com gems (500-2000)
- Desbloqueio automático por nível
- Equip/desquip avatar
- Stats no header

---

### 3. **AchievementBadge** `AchievementBadge.tsx`
Badge individual de achievement para exibição em grid.

```tsx
import { AchievementBadge } from '@/components/gamification/AchievementBadge';

// Uso
<AchievementBadge
  achievement={achievement}
  userAchievement={userAch}
  size="md"  // sm | md | lg
  showProgress={true}
  currentProgress={5}
  onClick={() => setSelected(achievement.id)}
/>
```

**Features:**
- Exibe emoji + nome
- Progressbar para achievements bloqueados
- Badge de tier (common, rare, epic, legendary)
- Lock icon se não-desbloqueado
- Efeito hover/tap

---

### 4. **AchievementsGrid** `AchievementsGrid.tsx`
Grid responsivo com filtro por categoria e estatísticas.

```tsx
import { AchievementsGrid } from '@/components/gamification/AchievementsGrid';

// Uso
<AchievementsGrid userId={user.id} />
```

**Features:**
- Exibe todos os 15 achievements
- Filtro por 5 categorias (hábitos, sequências, níveis, especiais, todos)
- Stats de gems totais earned
- Clicável - abre modal de detalhes
- Responsive grid (3-5 colunas)

---

### 5. **AchievementDetailModal** `AchievementDetailModal.tsx`
Modal com detalhes completos do achievement, progresso, e compartilhamento.

```tsx
import { AchievementDetailModal } from '@/components/gamification/AchievementDetailModal';

// Uso
<AchievementDetailModal
  achievementId="first_habit"
  userId={user.id}
  isOpen={isOpen}
  onClose={onClose}
/>
```

**Features:**
- Exibe emoji em grande tamanho
- Descrição e detalhes
- Progressbar com valores numéricos
- Status "Desbloqueada em X"
- Share buttons integrados
- Suporte a achievements secretos

---

### 6. **StreakFreezeCard** `StreakFreezeCard.tsx`
Card mostrando streak freezes disponíveis com opção de compra.

```tsx
import { StreakFreezeCard } from '@/components/gamification/StreakFreezeCard';

// Uso
<StreakFreezeCard userId={user.id} />

// Ou compacto
<StreakFreezeCard userId={user.id} compact={true} />
```

**Features:**
- Mostra freezes disponíveis
- Botão de compra (200 gems)
- Modo compacto para sidebars
- Descrição clara do que faz

---

### 7. **GemToast** `GemToast.tsx`
Toast notification que anima quando o usuário ganha gems.

```tsx
import { GemToast } from '@/components/gamification/GemToast';

// Uso (adicionar em página raiz)
<GemToast />
```

**Features:**
- Auto-dispara via custom event
- Anima de baixo para cima
- Auto-dismiss após 2.5s
- Stacking automático
- Mostra "+X gems"

---

### 8. **AchievementToast** `AchievementToast.tsx`
Toast celebratório quando achievement é desbloqueado.

```tsx
import { AchievementToast } from '@/components/gamification/AchievementToast';

// Uso (adicionar em página raiz)
<AchievementToast userId={user.id} />
```

**Features:**
- Auto-dispara via custom event
- Celebração visual (gradient, confetti effect)
- Mostra emoji + nome + gems
- Mais proeminente que GemToast
- Auto-dismiss após 5s
- Stacking automático

---

### 9. **ShareAchievement** `ShareAchievement.tsx`
Grupo de botões para compartilhar achievement em redes sociais.

```tsx
import { ShareAchievement } from '@/components/gamification/ShareAchievement';

// Uso
<ShareAchievement
  achievement={achievement}
  userStats={{ level: 5, streak: 7, gems: 250 }}
  size="md"  // sm | md
/>
```

**Features:**
- Copy to clipboard
- Twitter/X share
- WhatsApp share
- Native share (iOS/Android)
- Formata mensagem com stats
- Inclui link para https://habitz.app

---

## 🎣 Hook: useGamification

Extensão do hook existente com suporte a gems, avatares, achievements e freezes.

```tsx
import { useGamification } from '@/hooks/useGamification';

const MyComponent = ({ userId }) => {
  const {
    // GEMS
    gemsBalance,
    lifetimeGemsEarned,
    addGems,

    // AVATARS
    avatarsCatalog,
    userAvatars,
    equippedAvatar,
    purchaseAvatar,
    equipAvatar,

    // ACHIEVEMENTS
    achievementsCatalog,
    userAchievements,
    unlockAchievement,

    // STREAK FREEZES
    availableFreezes,
    purchaseStreakFreeze,
    useStreakFreeze,

    // Helpers
    canPurchaseAvatar,
    isAchievementUnlocked,
    getAchievementProgress,
  } = useGamification(userId);

  return <div>
    <p>Gems: {gemsBalance}</p>
    <p>Avatar: {equippedAvatar?.emoji}</p>
  </div>;
};
```

**Exports:**
- 20+ interfaces TypeScript
- 7 queries (React Query)
- 6 mutations
- 12+ helpers/utilities
- Props para 90+ configurações

---

## 📱 Integração nas Pages

### Dashboard.tsx

```tsx
// Imports adicionados
import { GemToast } from '@/components/gamification/GemToast';
import { AchievementToast } from '@/components/gamification/AchievementToast';

// Componentes renderizados
<GemToast />
<AchievementToast userId={user.id} />
```

### Profile.tsx

```tsx
// Imports adicionados
import { useGamification } from '@/hooks/useGamification';
import { AvatarShopModal } from '@/components/gamification/AvatarShopModal';
import { AchievementsGrid } from '@/components/gamification/AchievementsGrid';

// Avatar Section
<div className="flex items-center gap-4">
  <div className="text-4xl">{equippedAvatar?.emoji || '😊'}</div>
  <div>
    <h3>{equippedAvatar?.name}</h3>
    <Button onClick={() => setAvatarShopOpen(true)}>
      Mudar Avatar
    </Button>
  </div>
</div>

// Achievements Section
<Card>
  <h2>Conquistas</h2>
  <AchievementsGrid userId={userId} />
</Card>

// Modal
<AvatarShopModal
  isOpen={avatarShopOpen}
  onClose={() => setAvatarShopOpen(false)}
  userId={userId}
/>
```

---

## 🔄 Custom Events

Componentes disparam eventos customizados para comunicação entre si:

```typescript
// Gem gained
window.dispatchEvent(new CustomEvent('gamification:gems-changed', {
  detail: { userId, newBalance }
}));

// Avatar unlocked
window.dispatchEvent(new CustomEvent('gamification:avatar-unlocked', {
  detail: { userId }
}));

// Achievement unlocked
window.dispatchEvent(new CustomEvent('gamification:achievement-unlocked', {
  detail: { userId, achievementId, gemsEarned }
}));

// Freeze purchased
window.dispatchEvent(new CustomEvent('gamification:freeze-purchased', {
  detail: { userId }
}));

// Freeze used
window.dispatchEvent(new CustomEvent('gamification:freeze-used', {
  detail: { userId }
}));
```

---

## 🎨 Design Tokens

### Cores por Tier

```css
/* Avatares & Achievements */
--tier-common: #6B7280;     /* gray-500 */
--tier-uncommon: #10B981;   /* green-500 */
--tier-rare: #3B82F6;       /* blue-500 */
--tier-epic: #8B5CF6;       /* purple-500 */
--tier-legendary: #F59E0B;  /* yellow-500 */

/* Gems */
--gem-primary: #9333EA;     /* purple-600 */
--gem-secondary: #A855F7;   /* purple-500 */

/* Streak Freeze */
--freeze-primary: #3B82F6;  /* blue-500 */
--freeze-secondary: #06B6D4; /* cyan-500 */
```

---

## 📊 Economia de Gems

### Ganhos

| Ação | Gems | Frequência |
|------|------|------------|
| Completar 1 hábito | 10 | Ilimitado |
| Dia perfeito (100% hábitos) | 20 | Ilimitado |
| Achievement | 50-1000 | Uma vez |

### Gastos

| Item | Gems |
|------|------|
| Avatar comum | 500 |
| Avatar raro | 1000 |
| Avatar épico | 1500 |
| Avatar lendário | 2000 |
| Streak freeze | 200 |

---

## 🔍 Troubleshooting

### "GemCounter mostra 0 gems"
- Verificar que `useGamification` hook está retornando `gemsBalance`
- Verificar que user tem entry em `user_gems` table
- Rodar query: `SELECT * FROM user_gems WHERE user_id = '<user_id>'`

### "Avatar não aparece em Profile"
- Verificar que `useGamification` hook está retornando `equippedAvatar`
- Verificar que existe row em `user_avatars` com `is_equipped = true`
- Rodar query: `SELECT * FROM user_avatars WHERE user_id = '<user_id>' AND is_equipped = true`

### "Achievement não desbloqueia no modal"
- Verificar que `AchievementDetailModal` está sendo renderizado
- Verificar que `selectedAchievementId` está sendo passado corretamente
- Abrir console e verificar React Tree

### "Share buttons não aparecem"
- Verificar que `ShareAchievement` está sendo renderizado em `AchievementDetailModal`
- Verificar que `userStats` está sendo passado
- Verificar que achievement é um objeto válido

---

## 🚀 Próximos Passos

1. **Deploy**: Seguir `GAMIFICATION_DEPLOYMENT_GUIDE.md`
2. **Monitoramento**: Acompanhar métricas de usage
3. **Feedback**: Coletar feedback dos usuários
4. **Melhorias**: Daily challenges, leaderboards, power-ups

---

## 📚 Documentação Relacionada

- [Plano de Implementação](../../GAMIFICATION_PLAN.md)
- [Guia de Deployment](../GAMIFICATION_DEPLOYMENT_GUIDE.md)
- [Edge Function](../../supabase/functions/check-achievements/README.md)

---

**Status**: ✅ Implementação Completa | 📅 Pronto para Deploy | 🎯 8/8 Sprints Completos
