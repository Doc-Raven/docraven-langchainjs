import { ToolDefinition } from "@doc-raven/langchain-core/language_models/base";
import type { StructuredToolInterface } from "@doc-raven/langchain-core/tools";
import { isInteropZodSchema } from "@doc-raven/langchain-core/utils/types";
import { toJsonSchema } from "@doc-raven/langchain-core/utils/json_schema";

export {
  convertToOpenAIFunction as formatToOpenAIFunction,
  convertToOpenAITool as formatToOpenAITool,
} from "@doc-raven/langchain-core/utils/function_calling";

export function formatToOpenAIAssistantTool(
  tool: StructuredToolInterface
): ToolDefinition {
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: isInteropZodSchema(tool.schema)
        ? toJsonSchema(tool.schema)
        : tool.schema,
    },
  };
}
