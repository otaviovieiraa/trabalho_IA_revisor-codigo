import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'node:fs';

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'openai/gpt-oss-120b:free';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function obterCodigoDoUsuario(rl) {
  console.log('Como voce quer enviar o codigo?');
  console.log('1 - Colar o codigo aqui no terminal');
  console.log('2 - Informar o caminho de um arquivo\n');

  const opcao = (await rl.question('Escolha 1 ou 2: ')).trim();

  if (opcao === '2') {
    const caminho = (await rl.question('Caminho do arquivo: ')).trim();
    try {
      return fs.readFileSync(caminho, 'utf-8');
    } catch (err) {
      console.error(`Erro ao ler o arquivo "${caminho}": ${err.message}`);
      process.exit(1);
    }
  }

  console.log('\nCole o codigo abaixo. Quando terminar, digite FIM em uma linha sozinha e pressione Enter:\n');
  const linhas = [];
  while (true) {
    const linha = await rl.question('');
    if (linha.trim() === 'FIM') break;
    linhas.push(linha);
  }
  return linhas.join('\n');
}

function montarPrompt(codigo) {
  return `Voce e um revisor de codigo experiente. Analise o codigo abaixo e responda em portugues, de forma objetiva e organizada em topicos:

1. Erros: bugs, problemas de logica ou de sintaxe encontrados.
2. Melhorias: boas praticas, legibilidade, performance e seguranca.
3. Codigo sugerido: se fizer sentido, mostre apenas o trecho corrigido.

Se o codigo estiver correto e nao houver nada relevante a apontar, diga isso claramente em vez de inventar problemas.

Codigo a ser analisado:
\`\`\`
${codigo}
\`\`\``;
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

async function main() {
  if (!API_KEY) {
    console.error('Erro: defina OPENROUTER_API_KEY no arquivo .env antes de executar.');
    process.exit(1);
  }

  const rl = readline.createInterface({ input, output });

  console.log('Revisor de Codigo com IA \n');

  const codigo = await obterCodigoDoUsuario(rl);
  rl.close();

  if (!codigo.trim()) {
    console.error('\nNenhum codigo foi informado. Encerrando.');
    process.exit(1);
  }

  console.log('\nEnviando codigo para analise, aguarde...\n');

  try {
    const prompt = montarPrompt(codigo);
    const resposta = await chamarOpenRouter(prompt);

    console.log('=== Analise do codigo ===\n');
    console.log(resposta);
    console.log('\nFim da analise');
  } catch (err) {
    console.error('Erro ao chamar a API do OpenRouter:', err.message);
    process.exit(1);
  }
}

main();
