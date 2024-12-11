import { ChatOpenAI } from '@langchain/openai';
import { getGroqApiKey } from '../../config';
import logger from '../../utils/logger';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

export const loadGroqChatModels = async () => {
  const groqApiKey = getGroqApiKey();

  if (!groqApiKey) return {};

  try {
    logger.info(`process.env: `, process.env);
    logger.info(`process.env.HTTPS_PROXY: ${process.env.HTTPS_PROXY}`);
    const chatModels = {
      'llama-3.2-3b-preview': {
        displayName: 'Llama 3.2 3B',
        model: new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: 'llama-3.2-3b-preview',
            temperature: 0.7,
          },
          {
            baseURL: 'https://api.groq.com/openai/v1',
            httpAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY),
            fetch
          },
        ),
      },
      'llama-3.2-11b-vision-preview': {
        displayName: 'Llama 3.2 11B Vision',
        model: new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: 'llama-3.2-11b-vision-preview',
            temperature: 0.7,
          },
          {
            baseURL: 'https://api.groq.com/openai/v1',
            httpAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY),
            fetch
          },
        ),
      },
      'llama-3.2-90b-vision-preview': {
        displayName: 'Llama 3.2 90B Vision',
        model: new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: 'llama-3.2-90b-vision-preview',
            temperature: 0.7,
          },
          {
            baseURL: 'https://api.groq.com/openai/v1',
            httpAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY),
            fetch
          },
        ),
      },
      'llama-3.1-70b-versatile': {
        displayName: 'Llama 3.1 70B',
        model: new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: 'llama-3.1-70b-versatile',
            temperature: 0.7,
          },
          {
            baseURL: 'https://api.groq.com/openai/v1',          
            httpAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY),
            fetch
          },
        ),
      },
      'llama-3.1-8b-instant': {
        displayName: 'Llama 3.1 8B',
        model: new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: 'llama-3.1-8b-instant',
            temperature: 0.7,
          },
          {
            baseURL: 'https://api.groq.com/openai/v1',
            httpAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY),
            fetch
          },
        ),
      },
      'llama3-8b-8192': {
        displayName: 'LLaMA3 8B',
        model: new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: 'llama3-8b-8192',
            temperature: 0.7,
          },
          {
            baseURL: 'https://api.groq.com/openai/v1',
            httpAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY),
            fetch
          },
        ),
      },
      'llama3-70b-8192': {
        displayName: 'LLaMA3 70B',
        model: new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: 'llama3-70b-8192',
            temperature: 0.7,
          },
          {
            baseURL: 'https://api.groq.com/openai/v1',          
            httpAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY),
            fetch
          },
        ),
      },
      'mixtral-8x7b-32768': {
        displayName: 'Mixtral 8x7B',
        model: new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: 'mixtral-8x7b-32768',
            temperature: 0.7,
          },
          {
            baseURL: 'https://api.groq.com/openai/v1',
            httpAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY),
            fetch
          },
        ),
      },
      'gemma-7b-it': {
        displayName: 'Gemma 7B',
        model: new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: 'gemma-7b-it',
            temperature: 0.7,
          },
          {
            baseURL: 'https://api.groq.com/openai/v1',
            httpAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY),
            fetch
          },
        ),
      },
      'gemma2-9b-it': {
        displayName: 'Gemma2 9B',
        model: new ChatOpenAI(
          {
            openAIApiKey: groqApiKey,
            modelName: 'gemma2-9b-it',
            temperature: 0.7,
          },
          {
            baseURL: 'https://api.groq.com/openai/v1',
            httpAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY),
            fetch
          },
        ),
      },
    };

    return chatModels;
  } catch (err) {
    logger.error(`Error loading Groq models: ${err}`);
    return {};
  }
};
