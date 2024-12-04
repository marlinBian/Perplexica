import fs from 'fs';
import path from 'path';
import toml from '@iarna/toml';

const configFileName = 'config.toml';

interface Config {
  GENERAL: {
    PORT: number;
    SIMILARITY_MEASURE: string;
    KEEP_ALIVE: string;
  };
  API_KEYS: {
    OPENAI: string;
    GROQ: string;
    ANTHROPIC: string;
    GEMINI: string;
  };
  API_ENDPOINTS: {
    SEARXNG: string;
    OLLAMA: string;
  };
  AUTH: {
    ENDPOINT: string;
    NEXT_PUBLIC_STACK_PROJECT_ID: string;
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: string;
    STACK_SECRET_SERVER_KEY: string;
  };
  WX: {
    CODE2SESSION_ENDPOINT:string;
    MINI_APP_ID:string;
    MINI_APP_SECRET:string;
  };
  STACK_AUTH:{
    HOST:string;
    USER_PATH:string;
  };
  WX_TOKEN:{
    JWT_SECRET:string;
  }
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

const loadConfig = () =>
  toml.parse(
    fs.readFileSync(path.join(__dirname, `../${configFileName}`), 'utf-8'),
  ) as any as Config;

export const getPort = () => loadConfig().GENERAL.PORT;

export const getSimilarityMeasure = () =>
  loadConfig().GENERAL.SIMILARITY_MEASURE;

export const getKeepAlive = () => loadConfig().GENERAL.KEEP_ALIVE;

export const getOpenaiApiKey = () => loadConfig().API_KEYS.OPENAI;

export const getGroqApiKey = () => loadConfig().API_KEYS.GROQ;

export const getAnthropicApiKey = () => loadConfig().API_KEYS.ANTHROPIC;

export const getGeminiApiKey = () => loadConfig().API_KEYS.GEMINI;

export const getSearxngApiEndpoint = () =>
  process.env.SEARXNG_API_URL || loadConfig().API_ENDPOINTS.SEARXNG;

export const getOllamaApiEndpoint = () => loadConfig().API_ENDPOINTS.OLLAMA;

export const updateConfig = (config: RecursivePartial<Config>) => {
  const currentConfig = loadConfig();

  for (const key in currentConfig) {
    if (!config[key]) config[key] = {};

    if (typeof currentConfig[key] === 'object' && currentConfig[key] !== null) {
      for (const nestedKey in currentConfig[key]) {
        if (
          !config[key][nestedKey] &&
          currentConfig[key][nestedKey] &&
          config[key][nestedKey] !== ''
        ) {
          config[key][nestedKey] = currentConfig[key][nestedKey];
        }
      }
    } else if (currentConfig[key] && config[key] !== '') {
      config[key] = currentConfig[key];
    }
  }

  fs.writeFileSync(
    path.join(__dirname, `../${configFileName}`),
    toml.stringify(config),
  );
};

export const authURL = () => loadConfig().AUTH.ENDPOINT;

export const authProjectId = () => loadConfig().AUTH.NEXT_PUBLIC_STACK_PROJECT_ID;

export const authPublishableClientKey = () => loadConfig().AUTH.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

export const authSecretServerKey = () => loadConfig().AUTH.STACK_SECRET_SERVER_KEY;

export const wxCode2SessionURL = () => loadConfig().WX.CODE2SESSION_ENDPOINT

export const wxMiniAppID = () => loadConfig().WX.MINI_APP_ID

export const wxMiniAppSecret = () => loadConfig().WX.MINI_APP_SECRET

export const stackUserPath = () => loadConfig().STACK_AUTH.HOST + loadConfig().STACK_AUTH.USER_PATH

export const wxJwtToken = () => loadConfig().WX_TOKEN.JWT_SECRET