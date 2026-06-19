# Revisor de Codigo com IA

Projeto da disciplina **Fundamentos de Inteligencia Artificial - ADS**, atividade
"LLM via OpenRouter".

## Objetivo

Este projeto e um revisor de codigo automatico. O usuario cola um trecho de
codigo (ou informa o caminho de um arquivo) e a aplicacao envia esse codigo
para um modelo de linguagem (via API do OpenRouter), que retorna:

1. Erros e bugs encontrados;
2. Sugestoes de melhoria (boas praticas, legibilidade, performance, seguranca);
3. Uma versao corrigida do trecho, quando fizer sentido.

A ideia e simular uma ferramenta util no dia a dia de um desenvolvedor: uma
"segunda opiniao" rapida sobre um pedaco de codigo antes de um commit ou
durante os estudos.

## Entrada

O usuario escolhe, no terminal, uma de duas formas de enviar o codigo:

- **Colar o codigo diretamente**: digita ou cola linha por linha e finaliza
  digitando `FIM` sozinho em uma linha.
- **Informar o caminho de um arquivo**: por exemplo `./meucodigo.js` ou
  `C:\projetos\app.py`. A aplicacao le o conteudo do arquivo automaticamente.

## Processamento

O codigo informado e inserido em um prompt estruturado e enviado para o
modelo `openai/gpt-oss-120b:free` atraves da API do OpenRouter
(`https://openrouter.ai/api/v1/chat/completions`).

## Saida

A resposta do modelo e exibida no terminal, organizada em topicos (erros,
melhorias e, quando aplicavel, sugestao de codigo corrigido).

## Pre-requisitos

- [Node.js](https://nodejs.org/) versao 18 ou superior (necessario para o
  `fetch` nativo).
- Uma conta no [OpenRouter](https://openrouter.ai/) e uma chave de API
  (existe um tier gratuito).

## Instalacao

1. Baixe/extraia esta pasta do projeto.
2. Abra um terminal dentro da pasta `revisor-de-codigo-ia`.
3. Instale as dependencias:

   ```bash
   npm install
   ```

## Configurando a chave de API

1. Crie uma conta em [openrouter.ai](https://openrouter.ai/) e gere uma chave
   de API em **Keys** no painel do site.
2. Abra o arquivo `.env` que ja existe na pasta do projeto.
3. Substitua o valor de exemplo pela sua chave real:

   ```
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. Salve o arquivo. **Nunca compartilhe ou suba esse arquivo `.env` para um
   repositorio publico**, pois ele contem sua chave privada.

## Executando

Com as dependencias instaladas e a chave configurada, rode:

```bash
npm start
```

O programa vai perguntar como voce quer enviar o codigo (colar ou informar
arquivo) e, em seguida, mostrar a analise gerada pela IA no proprio terminal.

## Exemplo de uso

```
=== Revisor de Codigo com IA ===

Como voce quer enviar o codigo?
1 - Colar o codigo aqui no terminal
2 - Informar o caminho de um arquivo

Escolha 1 ou 2: 1

Cole o codigo abaixo. Quando terminar, digite FIM em uma linha sozinha e pressione Enter:

function soma(a, b) {
  return a + b
}
console.log(soma(2, "3"))
FIM

Enviando codigo para analise, aguarde...

=== Analise do codigo ===

1. Erros:
   - Falta de validacao de tipos: somar um numero com uma string causa
     concatenacao em vez de soma (2 + "3" = "23"), o que provavelmente nao
     e o resultado esperado.
   ...
```

## Conceitos aplicados nesta atividade

- **Comunicacao com API externa**: a funcao `chamarOpenRouter` faz uma
  requisicao HTTP (`fetch`) para o endpoint do OpenRouter, enviando o codigo
  do usuario e recebendo a analise em formato JSON.
- **Protecao da chave de API**: a chave nunca aparece no codigo-fonte. Ela
  fica isolada no arquivo `.env` e e carregada em tempo de execucao via
  `process.env.OPENROUTER_API_KEY`, graças ao `dotenv`.
- **Influencia do prompt na resposta**: a funcao `montarPrompt` define
  exatamente o que e pedido ao modelo (apontar erros, sugerir melhorias,
  propor correcao). Mudar esse texto muda o tipo de resposta gerada, mesmo
  para o mesmo trecho de codigo.
- **LLM como funcionalidade dentro de um sistema**: em vez de um chat
  generico, o modelo foi encaixado em um fluxo com entrada definida (codigo
  colado ou arquivo), processamento fixo (revisao de codigo) e saida
  estruturada (erros, melhorias e sugestao), funcionando como uma peca de
  um sistema maior.
