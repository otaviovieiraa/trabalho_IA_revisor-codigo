import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'openai/gpt-oss-120b:free';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

function montarPrompt(codigo) {
  return `Voce e um revisor de codigo experiente. Analise o codigo abaixo e responda em portugues, de forma objetiva e organizada em topicos:\n\n1. Erros: bugs, problemas de logica ou de sintaxe encontrados.\n2. Melhorias: boas praticas, legibilidade, performance e seguranca.\n3. Codigo sugerido: se fizer sentido, mostre apenas o trecho corrigido.\n\nSe o codigo estiver correto e nao houver nada relevante a apontar, diga isso claramente em vez de inventar problemas.\n\nCodigo a ser analisado:\n\`\`\`\n${codigo}\n\`\`\``;
}

async function chamarOpenRouter(prompt) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost',
      'X-Title': 'Revisor de Codigo IA'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }
  const resposta = data.choices?.[0]?.message?.content;
  if (!resposta) {
    throw new Error('A API nao retornou uma resposta valida:\n' + JSON.stringify(data, null, 2));
  }
  return resposta;
}

function criarApp() {
  if (!API_KEY) {
    throw new Error('Erro: defina OPENROUTER_API_KEY no arquivo .env antes de executar.');
  }

  const app = express();
  app.use(express.json());

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, 'public')));

  app.post('/api/review', async (req, res) => {
    const codigo = req.body.codigo;
    if (!codigo || !codigo.toString().trim()) {
      return res.status(400).json({ erro: 'Envie um codigo valido para ser revisado.' });
    }

    try {
      const prompt = montarPrompt(codigo.toString());
      const resposta = await chamarOpenRouter(prompt);
      res.json({ resposta });
    } catch (err) {
      console.error('Erro ao chamar a API do OpenRouter:', err);
      res.status(500).json({ erro: 'Erro ao chamar a API de revisao. ' + err.message });
    }
  });

  return app;
}

const porta = process.env.PORT || 3000;
const app = criarApp();
app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});