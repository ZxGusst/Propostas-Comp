# Briefing de Pesquisa — Logística e Precificação

## Princípio geral

Toda proposta parte de pesquisa real de preços — nunca use valores de memória sem verificar. Os custos de logística variam por data, rota e sazonalidade. Pesquise sempre antes de fechar os números.

---

## 1. Pesquisa de logística

### Transporte BSB → Destino

**Ônibus (eventos nacionais próximos):**
- Busque em: rome2rio.com, clickbus.com.br, buscaonibus.com.br
- Filtre: Brasília → [cidade do evento]
- Pegue o preço de ida + volta, para 2 pessoas
- Referência: BSB → Alto Paraíso ~R$ 80-120 por pessoa (ida)

**Aéreo (eventos distantes ou logística crítica):**
- Busque em: google.com/flights, espiadaki.com.br
- Datas: chegada 1 dia antes, saída 1 dia após o evento
- Para 2 pessoas (ida + volta)
- Referência: BSB → GIG (Rock in Rio) ~R$ 800-1.400 por pessoa (ida + volta, 3-4 meses antes)

### Hospedagem

- Busque em: booking.com, airbnb.com.br
- Filtro: 2 quartos (ou 1 quarto duplo) próximo ao local do evento
- Período: check-in véspera, check-out após o evento
- Referência: Rio de Janeiro ~R$ 300-600/noite por quarto

### Aluguel de equipamentos

- Pesquise em locadoras locais se necessário (câmeras extras, trilhos, estabilizadores)
- Inclua no valor de captação se relevante

---

## 2. Estrutura de precificação

### Por operação

```
Captação = Diária da equipe + Logística completa (transporte + hospedagem + deslocamento)
Pós-produção = Edição + Color + Mix de áudio + Exportação
```

**Valores de referência (Abril 2026):**

| Tipo de evento | Captação | Pós-produção | Total op |
|---|---|---|---|
| Festival regional (ônibus) | R$ 1.500 | R$ 700 | R$ 2.200 |
| Festival nacional (aéreo) | R$ 4.100 | R$ 1.000 | R$ 5.100 |
| Show local (sem deslocamento) | R$ 800 | R$ 500 | R$ 1.300 |

Ajuste conforme pesquisa real dos custos logísticos.

### Desconto de pacote (múltiplas operações)

Quando o cliente fecha 2+ operações:
- Desconto típico: 4-5% sobre o total bruto
- Apresente: "Total Bruto" e "Total Pacote" com o badge de desconto
- Fórmula: `total_pacote = total_bruto × (1 - desconto%)`

**Exemplo:**
```
Op 01: R$ 2.200
Op 02: R$ 5.100
Total Bruto: R$ 7.300
Desconto 5%: -R$ 365
Total Pacote: R$ 6.935 → arredonde para número limpo (ex: R$ 6.950)
```

---

## 3. Plano de pagamento

Padrão: 5 parcelas mensais, com desconto na 1ª parcela para incentivar fechamento.

**Fórmula:**
```
parcela_base = total_pacote / 5
parcela_1 = parcela_base × 0.95   (5% de desconto)
parcela_2_a_5 = (total_pacote - parcela_1) / 4

Verificação: parcela_1 + (parcela_2_a_5 × 4) = total_pacote ✓
```

**Exemplo com R$ 6.950:**
```
parcela_base = 6.950 / 5 = 1.390
parcela_1 = 1.390 × 0.95 = 1.320,50 → arredonde: R$ 1.320
parcela_2_a_5 = (6.950 - 1.320) / 4 = 5.630 / 4 = R$ 1.407,50

Verificação: 1.320 + (1.407,50 × 4) = 1.320 + 5.630 = 6.950 ✓
```

**Distribuição temporal** (ajuste conforme datas reais):
```
Mês 1: 1ª parcela · Fechamento  [badge: -5% FECHAMENTO]
Mês 2: 2ª parcela
Mês 3: 3ª parcela
Mês 4: 4ª parcela · Pré [evento principal]
Mês 5: 5ª parcela · Entrega final
```

---

## 4. Pesquisa de Shotdeck (referências visuais)

O shotdeck mostra ao cliente o estilo de filmagem que será utilizado. Use vídeos reais do YouTube.

**Como pesquisar:**

Para cada câmera/ângulo, busque no YouTube:
```
[Artista/Estilo] + [Evento/Festival] + [Ano] + "live set"
```

Exemplos de buscas eficientes:
- `"Charlotte de Witte" Kappa FuturFestival 2025`
- `Mochakk Coachella 2026`
- `WhoMadeWho BOMA 2025`
- `Nina Kraviz Tomorrowland 2026`

**Ângulos padrão e suas descrições:**
```
Câmera 1: Na CDJ lateralizado no DJ (booth/lateral)
Câmera 2: Móvel na pista contornando o Artista + Detalhes
Câmera 3: Pista aberta no artista (wide shot)
Câmera 4 (se houver): Móvel no Booth (close-ups equipamentos)
```

Use o link do YouTube encontrado no atributo `href` do shotdeck-ref. Certifique-se de que o link é real e o vídeo existe antes de incluir.

---

## 5. Timeline das operações

Construa a timeline com base nas datas reais informadas pelo cliente:

```
Etapa 1: [Mês do fechamento] — Fechamento + Pré-produção
  → Assinatura, briefing, planejamento, compra de passagens

Etapa 2: [Data do evento 1] — Operação 01 — [Nome evento]
  → Deslocamento [origem] → [destino] ([modal]). Captação.
  → Entrega Drops: em até 48h após o set

Etapa 3 (se houver): [Data do evento 2] — Operação 02 — [Nome evento]
  → Deslocamento [origem] → [destino] ([modal]). Captação.
  → Entrega Drops: 48h | Full Sets: até 21 dias

Etapa final: [~30 dias após último evento] — Entrega Final
  → Full Sets finalizados, masterizados e entregues
```

**Nota padrão (adapte os dados):**
> NF inclusa. Valores de logística baseados em pesquisa atualizada ([Mês/Ano]). Passagens aéreas e hospedagens sujeitas a variação — reserva antecipada garante melhor preço. Proposta válida por 7 dias.
