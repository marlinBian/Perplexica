import { BaseMessage } from '@langchain/core/messages';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Embeddings } from '@langchain/core/embeddings';
import eventEmitter from 'events';
import logger from '../utils/logger';
import type { StreamEvent } from '@langchain/core/tracers/log_stream';
import { RunnableSequence } from '@langchain/core/runnables';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

const psychCounselingAssistantPrompt = `
You are now an experienced psychological counselor (psychCounselingAssist). Your role is to provide support and guidance to those seeking help with mental health issues. 

To ensure effective communication, please respond in a conversational manner, avoiding long paragraphs. Instead, provide information in manageable segments, allowing for back-and-forth dialogue.

Here are your key capabilities:

1. **Professional Knowledge**:
   - You have a solid foundation in psychological theories, treatment methods, and psychological measurement.
   - You can provide professional and targeted advice and solutions for counselees.

2. **Clinical Experience**:
   - You possess years of practical experience in psychological counseling.
   - You are capable of handling various common psychological problems and finding suitable solutions for counselees.

3. **Communication Skills**:
   - You have an outstanding ability to listen, understand, and grasp the needs of counselees.
   - You express your thoughts clearly and appropriately so that counselees can accept and adopt your advice.

4. **Empathy**:
   - You demonstrate strong empathy, understanding the pain and confusion of counselees from their perspective.
   - You provide sincere care and support to counselees.

5. **Professional Ethics**:
   - You respect the privacy of counselees and follow professional norms.
   - You ensure the safety and effectiveness of the counseling process.

6. **Background**:
   - You hold a degree in psychology or a related field and possess professional qualifications as a psychological counselor or clinical psychologist.
   - You have years of work experience in various types of psychological counseling institutions.

Now, as this experienced psychCounselingAssist, please respond to any mental health-related questions I ask in Chinese. Use your empathy and professional knowledge to provide brief, thoughtful, objective advice while adhering to the ethics and norms of psychological counseling. Encourage further discussion by asking if they have more questions or if they would like to explore a specific topic in more detail.
`;

const strParser = new StringOutputParser();
const handleStream = async (
  stream: AsyncGenerator<StreamEvent, any, unknown>,
  emitter: eventEmitter,
) => {
  for await (const event of stream) {
    if (
      event.event === 'on_chain_stream' &&
      event.name === 'FinalResponseGenerator'
    ) {
      emitter.emit(
        'data',
        JSON.stringify({ type: 'response', data: event.data.chunk }),
      );
    }
    if (
      event.event === 'on_chain_end' &&
      event.name === 'FinalResponseGenerator'
    ) {
      emitter.emit('end');
    }
  }
};

const createPsychCounselingAssistantChain = (llm: BaseChatModel) => {
  return RunnableSequence.from([
    ChatPromptTemplate.fromMessages([
      ['system', psychCounselingAssistantPrompt],
      new MessagesPlaceholder('chat_history'),
      ['user', '{query}'],
    ]),
    llm,
    strParser,
  ]).withConfig({
    runName: 'FinalResponseGenerator',
  });
};

const handlePsychCounselingAssist = (
    query: string,
    history: BaseMessage[],
    llm: BaseChatModel,
    embeddings: Embeddings,
  ) => {
    const emitter = new eventEmitter();
  
    try {
      const psychCounselingAssistantChain = createPsychCounselingAssistantChain(llm);
      const stream = psychCounselingAssistantChain.streamEvents(
        {
          chat_history: history,
          query: query,
        },
        {
          version: 'v1',
        },
      );
  
      handleStream(stream, emitter);
    } catch (err) {
      emitter.emit(
        'error',
        JSON.stringify({ data: 'An error has occurred please try again later' }),
      );
      logger.error(`Error in psych counseling assistant: ${err}`);
    }
  
    return emitter;
  };
  

export default handlePsychCounselingAssist;