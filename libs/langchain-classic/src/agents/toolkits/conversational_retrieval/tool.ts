import type { BaseRetrieverInterface } from "@doc-raven/langchain-core/retrievers";
import { z } from "zod";
import { CallbackManagerForToolRun } from "@doc-raven/langchain-core/callbacks/manager";
import {
  DynamicStructuredTool,
  DynamicStructuredToolInput,
} from "@doc-raven/langchain-core/tools";
import { formatDocumentsAsString } from "../../../util/document.js";

export function createRetrieverTool(
  retriever: BaseRetrieverInterface,
  input: Omit<DynamicStructuredToolInput, "func" | "schema">
) {
  const func = async (
    { input }: { input: string },
    runManager?: CallbackManagerForToolRun
  ) => {
    const docs = await retriever.invoke(
      input,
      runManager?.getChild("retriever")
    );
    return formatDocumentsAsString(docs);
  };
  const schema = z.object({
    input: z
      .string()
      .describe("Natural language query used as input to the retriever"),
  });
  return new DynamicStructuredTool({ ...input, func, schema });
}
