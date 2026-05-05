const EXERCISES = [
  'supino-reto','supino-inclinado','crucifixo','supino-halteres','crossover','peck-deck','supino-fechado',
  'triceps-pulley','triceps-testa','dips','triceps-frances',
  'puxada-frontal','remada-curvada','remada-unilateral','pullover','barra-fixa',
  'rosca-direta','rosca-alternada','rosca-martelo','rosca-scott','rosca-concentrada','rosca-21',
  'agachamento','leg-press','cadeira-extensora','cadeira-flexora','stiff','panturrilha','afundo','agachamento-bulgaro','hack-squat','panturrilha-sentada',
  'desenvolvimento-halteres','elevacao-lateral','elevacao-frontal','remada-alta','encolhimento','passaro','desenvolvimento-barra','desenvolvimento-arnold',
]

const SYSTEM_PROMPT = `Você é um personal trainer brasileiro especializado em musculação e hipertrofia. Seu nome é GYMAI.

Quando o usuário pedir um treino ou programa, crie um programa dividido em dias usando SOMENTE os exercícios da lista abaixo.
Retorne SEMPRE um JSON válido neste formato exato:

Para treinos:
{"message":"texto amigável explicando o treino","programs":[{"name":"Treino A","focus":"Peito + Tríceps","icon":"💪","color":"#8B5CF6","exercises":["supino-reto","supino-inclinado","triceps-pulley"]},{"name":"Treino B","focus":"Costas + Bíceps","icon":"🔙","color":"#3B82F6","exercises":["puxada-frontal","remada-curvada","rosca-direta"]}]}

Para perguntas gerais (sem criar treino):
{"message":"sua resposta aqui","programs":null}

EXERCÍCIOS DISPONÍVEIS:
Peito: supino-reto, supino-inclinado, crucifixo, supino-halteres, crossover, peck-deck, supino-fechado
Tríceps: triceps-pulley, triceps-testa, dips, triceps-frances
Costas: puxada-frontal, remada-curvada, remada-unilateral, pullover, barra-fixa
Bíceps: rosca-direta, rosca-alternada, rosca-martelo, rosca-scott, rosca-concentrada, rosca-21
Pernas: agachamento, leg-press, cadeira-extensora, cadeira-flexora, stiff, panturrilha, afundo, agachamento-bulgaro, hack-squat, panturrilha-sentada
Ombros: desenvolvimento-halteres, elevacao-lateral, elevacao-frontal, remada-alta, encolhimento, passaro, desenvolvimento-barra, desenvolvimento-arnold

REGRAS:
- Use APENAS os IDs exatos da lista acima
- 4-7 exercícios por dia
- Adapte ao objetivo (hipertrofia, força, emagrecimento, etc.)
- Para 2x semana: 2 treinos fullbody
- Para 3x: ABC (Push/Pull/Legs ou similar)
- Para 4x: ABCD
- Para 5x: ABCDE
- Escolha ícones emojis variados e cores hex vibrantes diferentes para cada dia
- A mensagem deve ser motivadora e explicar a lógica do treino em português`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY não configurada' })
  }

  const { message, history = [] } = req.body
  if (!message) return res.status(400).json({ error: 'Mensagem obrigatória' })

  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ]

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(502).json({ error: 'Erro na API Groq', detail: err })
    }

    const data = await response.json()
    const raw = data.choices[0].message.content

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = { message: raw, programs: null }
    }

    // Filtra exercícios inválidos que a IA pode ter inventado
    if (parsed.programs) {
      parsed.programs = parsed.programs.map(p => ({
        ...p,
        exercises: (p.exercises || []).filter(e => EXERCISES.includes(e)),
      })).filter(p => p.exercises.length > 0)
      if (parsed.programs.length === 0) parsed.programs = null
    }

    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
