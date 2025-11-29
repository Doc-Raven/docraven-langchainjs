import {
  patchConfig,
  pickRunnableConfigKeys,
  RunnableFunc,
} from "@doc-raven/langchain-core/runnables";
import { AsyncLocalStorageProviderSingleton } from "@doc-raven/langchain-core/singletons";
import { DynamicTool, ToolRunnableConfig } from "@doc-raven/langchain-core/tools";
import OpenAI from "openai";

export type CustomToolFields = Omit<OpenAI.Responses.CustomTool, "type">;

export function customTool(
  func: RunnableFunc<string, string, ToolRunnableConfig>,
  fields: CustomToolFields
): DynamicTool<string> {
  return new DynamicTool({
    ...fields,
    description: "",
    metadata: {
      customTool: fields,
    },
    func: async (input, runManager, config) =>
      new Promise<string>((resolve, reject) => {
        const childConfig = patchConfig(config, {
          callbacks: runManager?.getChild(),
        });
        // eslint-disable-next-line no-void
        void AsyncLocalStorageProviderSingleton.runWithConfig(
          pickRunnableConfigKeys(childConfig),
          async () => {
            try {
              resolve(func(input, childConfig));
            } catch (e) {
              reject(e);
            }
          }
        );
      }),
  });
}
