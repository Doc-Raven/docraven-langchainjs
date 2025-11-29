import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@doc-raven/langchain-core/prompts";

const model = new ChatOpenAI({
  openAIApiKey: "sk-XXXX",
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);
