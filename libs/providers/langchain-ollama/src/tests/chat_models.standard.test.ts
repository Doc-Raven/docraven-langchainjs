import { ChatModelUnitTests } from "@langchain/standard-tests/vitest";
import { AIMessageChunk } from "@doc-raven/langchain-core/messages";
import { ChatOllama, ChatOllamaCallOptions } from "../chat_models.js";

class ChatOllamaStandardUnitTests extends ChatModelUnitTests<
  ChatOllamaCallOptions,
  AIMessageChunk
> {
  constructor() {
    super({
      Cls: ChatOllama,
      chatModelHasToolCalling: true,
      chatModelHasStructuredOutput: true,
      constructorArgs: {
        model: "llama3-groq-tool-use",
      },
    });
  }

  testChatModelInitApiKey() {
    this.skipTestMessage(
      "testChatModelInitApiKey",
      "ChatOllama",
      "API key is not required for ChatOllama"
    );
  }
}

const testClass = new ChatOllamaStandardUnitTests();
testClass.runTests("ChatOllamaStandardUnitTests");
