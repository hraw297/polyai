# PolyAI Local – Multi-Model Chat (Node.js)

A simple Node.js application that lets you ask questions to multiple LLM providers in one place — including OpenAI (ChatGPT), Claude, Gemini, and Grok.

This project was inspired by https://polygpt.io/, but built to run locally with your own API keys for full control and privacy.

---

## Features

* Query multiple AI models from a single interface
* Interactive API key setup (no manual `.env` editing)
* Runs entirely locally
* Lightweight and simple Node.js setup
* Easy to extend with more providers

---

## Supported Models

* OpenAI (ChatGPT)
* Anthropic (Claude)
* Google (Gemini)
* xAI (Grok)

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/hraw297/polyai.git
cd polyai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the app

```bash
node index.js
```

---

## First Run Experience

When you start the app for the first time:

* You will be prompted to enter your API keys directly in the UI
* The app will automatically generate and store them for future use
* No manual `.env` setup required

---

## Usage

Once running, the app will:

1. Prompt you for a question
2. Send the query to all configured providers
3. Return responses from each model

This makes it easy to compare outputs across different LLMs in real time.

---

## Contributing

Feel free to open issues or submit PRs to improve the project.

---

## License

MIT License
