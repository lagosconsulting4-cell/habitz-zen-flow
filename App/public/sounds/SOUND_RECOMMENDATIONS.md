# Recomendações de Sons - Gamificação Habitz

## ⚠️ IMPORTANTE
Você precisa baixar 5 arquivos de som MP3 e colocá-los nesta pasta (`App/public/sounds/`).

## Sons Recomendados (com links diretos)

### 1. `complete.mp3` - Conclusão de Hábito
**Característica**: Som leve e satisfatório (ding ou pop)

**Recomendações Específicas:**
- **Opção 1 (Recomendada)**: "Soft UI Notification"
  - Link: https://freesound.org/people/Leszek_Szary/sounds/171670/
  - Descrição: Som suave de notificação, perfeito para conclusões
  - Duração: 0.5s
  - Licença: CC0 (domínio público)

- **Opção 2**: "Pop Bubble"
  - Link: https://freesound.org/people/InspectorJ/sounds/411642/
  - Descrição: Pop suave e agradável
  - Licença: CC-BY 3.0

**Como baixar:**
1. Clique no link
2. Clique em "Download" (pode precisar criar conta grátis)
3. Renomeie o arquivo para `complete.mp3`
4. Coloque em `App/public/sounds/`

---

### 2. `level-up.mp3` - Subir de Nível
**Característica**: Som triunfante e excitante (fanfarra)

**Recomendações Específicas:**
- **Opção 1 (Recomendada)**: "Achievement Unlock"
  - Link: https://freesound.org/people/LittleRobotSoundFactory/sounds/270404/
  - Descrição: Fanfarra de conquista perfeita para level-up
  - Duração: 1.5s
  - Licença: CC-BY 3.0

- **Opção 2**: "Victory Sound"
  - Link: https://freesound.org/people/plasterbrain/sounds/397355/
  - Descrição: Som de vitória curto e animado
  - Licença: CC0

**Alternativa (Mixkit):**
- Link: https://mixkit.co/free-sound-effects/game-over/
- Procure por "Bonus earned"

---

### 3. `streak.mp3` - Bônus de Sequência
**Característica**: Encorajador e energético

**Recomendações Específicas:**
- **Opção 1 (Recomendada)**: "Coin Collect"
  - Link: https://freesound.org/people/ProjectsU012/sounds/341695/
  - Descrição: Som de moeda/power-up
  - Duração: 1s
  - Licença: CC0

- **Opção 2**: "Power Up"
  - Link: https://mixkit.co/free-sound-effects/game/
  - Procure "Quick win"
  - Licença: Mixkit License (uso livre)

---

### 4. `day-complete.mp3` - Dia Perfeito
**Característica**: Celebratório e gratificante

**Recomendações Específicas:**
- **Opção 1 (Recomendada)**: "Success Chime"
  - Link: https://freesound.org/people/Kastenfrosch/sounds/521961/
  - Descrição: Melodia celebratória curta
  - Duração: 2s
  - Licença: CC0

- **Opção 2**: "Victory Fanfare"
  - Link: https://freesound.org/people/EVRetro/sounds/495005/
  - Descrição: Fanfarra de vitória completa
  - Licença: CC-BY 3.0

---

### 5. `unlock.mp3` - Item Desbloqueado
**Característica**: Mágico, revelação de recompensa

**Recomendações Específicas:**
- **Opção 1 (Recomendada)**: "Magic Sparkle"
  - Link: https://freesound.org/people/plasterbrain/sounds/243020/
  - Descrição: Som mágico de desbloqueio
  - Duração: 1.2s
  - Licença: CC0

- **Opção 2**: "Item Unlock"
  - Link: https://mixkit.co/free-sound-effects/game/
  - Procure "Magic unlock"
  - Licença: Mixkit License

---

## Passo a Passo para Instalação

### 1. Criar Conta no Freesound (se necessário)
- Acesse: https://freesound.org/
- Clique em "Sign up" (gratuito)
- Confirme o email

### 2. Baixar os Sons
Para cada som recomendado:
1. Clique no link
2. Clique em "Download"
3. Escolha a melhor qualidade MP3 (ou baixe WAV e converta)

### 3. Renomear Arquivos
Renomeie os arquivos baixados exatamente assim:
- `complete.mp3`
- `level-up.mp3`
- `streak.mp3`
- `day-complete.mp3`
- `unlock.mp3`

### 4. Colocar na Pasta
Mova todos os 5 arquivos MP3 para:
```
App/public/sounds/
```

### 5. Verificar Instalação
Os arquivos devem estar assim:
```
App/public/sounds/
├── complete.mp3
├── level-up.mp3
├── streak.mp3
├── day-complete.mp3
├── unlock.mp3
├── README.md
└── SOUND_RECOMMENDATIONS.md (este arquivo)
```

---

## Alternativas Rápidas (Mixkit - Sem Cadastro)

Se preferir não criar conta, use Mixkit:

1. **Acesse**: https://mixkit.co/free-sound-effects/game/
2. **Procure por**:
   - "Bonus earned" → `complete.mp3`
   - "Game level completed" → `level-up.mp3`
   - "Quick win" → `streak.mp3`
   - "Arcade game jump" → `day-complete.mp3`
   - "Magic unlock" → `unlock.mp3`
3. **Download direto** (MP3)

---

## Conversão de Formato (se necessário)

Se baixar em WAV ou outro formato, use uma ferramenta online:
- **CloudConvert**: https://cloudconvert.com/wav-to-mp3
- **Online Audio Converter**: https://online-audio-converter.com/

Configurações recomendadas:
- Bitrate: 128 kbps
- Sample rate: 44100 Hz
- Canais: Stereo

---

## Licenças e Atribuição

### CC0 (Domínio Público)
Sem necessidade de atribuição. Uso livre.

### CC-BY 3.0/4.0
Requer atribuição. Adicione créditos em `App/CREDITS.md`:

```markdown
## Sound Credits

- "Soft UI Notification" by Leszek_Szary (CC0) - Freesound.org
- "Achievement Unlock" by LittleRobotSoundFactory (CC-BY 3.0) - Freesound.org
[... outros sons...]
```

### Mixkit License
Uso livre para projetos pessoais e comerciais. Sem necessidade de atribuição.

---

## Verificação Técnica

Após instalar os sons, você pode testá-los:

1. Abra o Console do navegador (F12)
2. Execute:
```javascript
import { sounds } from '@/lib/sounds';

// Testar cada som
sounds.complete();
sounds.levelUp();
sounds.streak();
sounds.dayComplete();
sounds.unlock();
```

---

## Problemas Comuns

### Sons não tocam
- **Verifique**: Arquivos estão em `App/public/sounds/`
- **Verifique**: Nomes dos arquivos estão corretos (minúsculas, sem espaços)
- **Verifique**: Formato é MP3
- **Verifique**: Navegador permite autoplay de áudio

### Som muito alto/baixo
Ajuste em `App/src/lib/sounds.ts`:
```typescript
const DEFAULT_VOLUMES = {
  complete: 0.4,      // 40% (ajuste aqui)
  levelUp: 0.6,       // 60%
  streak: 0.5,        // 50%
  dayComplete: 0.7,   // 70%
  unlock: 0.5,        // 50%
};
```

---

## Suporte

Se tiver problemas, verifique:
1. ✅ Os 5 arquivos MP3 estão na pasta `App/public/sounds/`
2. ✅ Os nomes dos arquivos estão corretos
3. ✅ Servidor de desenvolvimento foi reiniciado após adicionar os arquivos
4. ✅ Navegador permite reprodução de áudio

---

**Última atualização**: 2025-11-26
**Sistema de sons**: v1.0 (celebrations.ts + sounds.ts)
