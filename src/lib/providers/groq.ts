import { ChatOpenAI } from '@langchain/openai';
import { getGroqApiKey } from '../../config';
import logger from '../../utils/logger';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

export const loadGroqChatModels = async () => {
  const groqApiKey = getGroqApiKey();

  if (!groqApiKey) return {};

  try {
    const chatModels = {
      'Llama 3.1 70B': new ChatOpenAI(
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
      'Llama 3.1 8B': new ChatOpenAI(
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
      'LLaMA3 8b': new ChatOpenAI(
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
      'LLaMA3 70b': new ChatOpenAI(
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
      'Mixtral 8x7b': new ChatOpenAI(
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
      'Gemma 7b': new ChatOpenAI(
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
      'Gemma2 9b': new ChatOpenAI(
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
    };

    return chatModels;
  } catch (err) {
    logger.error(`Error loading Groq models: ${err}`);
    return {};
  }
};
