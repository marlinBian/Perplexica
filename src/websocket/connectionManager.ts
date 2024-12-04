import { WebSocket } from 'ws';
import { handleMessage } from './messageHandler';
import {
  getAvailableEmbeddingModelProviders,
  getAvailableChatModelProviders,
} from '../lib/providers';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Embeddings } from '@langchain/core/embeddings';
import type { IncomingMessage } from 'http';
import logger from '../utils/logger';
import { ChatOpenAI } from '@langchain/openai';
import { currentUser } from '../user/loginStatus';
import jwt from 'jsonwebtoken';
import { wxJwtToken } from '../config';

export const handleConnection = async (
  ws: WebSocket,
  request: IncomingMessage,
) => {
  try {
    let userID: string
    let chatModelProvider
    let chatModel
    let embeddingModelProvider
    let embeddingModel
    let openAIApiKey 
    let openAIBaseURL
    const [chatModelProviders, embeddingModelProviders] = await Promise.all([
      getAvailableChatModelProviders(),
      getAvailableEmbeddingModelProviders(),
    ]);

    if ((request.headers['request-type'] as string) === 'wx') {
      const token = (request.headers['x-wxmini-access-token'] as string)
      const decoded = jwt.verify(token, wxJwtToken())
      userID = (decoded as any).openid
      
      chatModelProvider = Object.keys(chatModelProviders)[0];

      chatModel =  Object.keys(chatModelProviders[chatModelProvider])[0];

      embeddingModelProvider = Object.keys(embeddingModelProviders)[0];
      
      embeddingModel = Object.keys(embeddingModelProviders[embeddingModelProvider])[0];
      
    } else {
      const url = new URL(request.url, `http://${request.headers.host}`)
      const searchParams = url.searchParams;

      const accessToken = searchParams.get('x-stack-access-token');
      const refreshToken = searchParams.get('x-stack-refresh-token');
      const { id } = (await currentUser(accessToken, refreshToken)) as any;
      userID = id as string | undefined;

      chatModelProvider = searchParams.get('chatModelProvider') || Object.keys(chatModelProviders)[0];

      chatModel = searchParams.get('chatModel') || Object.keys(chatModelProviders[chatModelProvider])[0];

      embeddingModelProvider = searchParams.get('embeddingModelProvider') || Object.keys(embeddingModelProviders)[0];
      
      embeddingModel = searchParams.get('embeddingModel') || Object.keys(embeddingModelProviders[embeddingModelProvider])[0];
      
      openAIApiKey = searchParams.get('openAIApiKey')
      openAIBaseURL = searchParams.get('openAIBaseURL')
    }
    if (!userID){
      ws.send(
        JSON.stringify({
          type: 'error',
          data: 'no user id',
          key: 'INVALID_NO_USERID',
        }),
      );
      ws.close();
      return
    }

    let llm: BaseChatModel | undefined;
    let embeddings: Embeddings | undefined;

    if (
      chatModelProviders[chatModelProvider] &&
      chatModelProviders[chatModelProvider][chatModel] &&
      chatModelProvider != 'custom_openai'
    ) {
      llm = chatModelProviders[chatModelProvider][chatModel]
        .model as unknown as BaseChatModel | undefined;
    } else if (chatModelProvider == 'custom_openai') {
      llm = new ChatOpenAI({
        modelName: chatModel,
        openAIApiKey: openAIApiKey,
        temperature: 0.7,
        configuration: {
          baseURL: openAIBaseURL,
        },
      }) as unknown as BaseChatModel;
    }

    if (
      embeddingModelProviders[embeddingModelProvider] &&
      embeddingModelProviders[embeddingModelProvider][embeddingModel]
    ) {
      embeddings = embeddingModelProviders[embeddingModelProvider][
        embeddingModel
      ].model as Embeddings | undefined;
    }

    if (!llm || !embeddings) {
      ws.send(
        JSON.stringify({
          type: 'error',
          data: 'Invalid LLM or embeddings model selected, please refresh the page and try again.',
          key: 'INVALID_MODEL_SELECTED',
        }),
      );
      ws.close();
    }

    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'signal',
            data: 'open',
          }),
        );
        clearInterval(interval);
      }
    }, 5);

    ws.on(
      'message',
      async (message) =>
        await handleMessage(userID, message.toString(), ws, llm, embeddings),
    );

    ws.on('close', () => logger.debug('Connection closed'));
  } catch (err) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: 'Internal server error.',
        key: 'INTERNAL_SERVER_ERROR',
      }),
    );
    ws.close();
    logger.error(err);
  }
};
