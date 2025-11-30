import { TodoSchemaType } from "../src/agents/middleware/todoListMiddleware";
import { TodoListEventsDetector } from "../src/agents/todoListDetector"

/** Example of use todo list detector with @doc-raven/deepagents */
async function todoListDetectorDeepAgents() {
    // Initializes detector with empty todo list (initially)
    const detector = new TodoListEventsDetector();
    
    // Registers the todo progress listeners (has to be defined above the onTodoProgress function)
    detector.listen("created-todo-list", todos => {
        /** ...Here can be logic communicates to client the progress */
    })

    detector.listen("completed-todo-list", todos => {
        /** ...Here can be logic communicates to client the progress */
    })

    // ... More events can be defined reagrd to your needances and **type TodoListDetectionEvents**
    
    // Registers the progress in Todo List
    async function onTodoProgress(todos: TodoSchemaType[]) {
        /**
         * 1. Emits the events regard to detected cases from TodoListDetectionEvents e.g: "created-todo-list", "new-element-todo-list"
         * 2. Overrides the detector.baseTodoList list with todos provided as param
        */
        detector.detect(todos);
    }
    
    // Invokes @doc-raven/deepagent with onTodoProgress definition
    const agent = createDeepAgent({
        model: "gpt-5-nano",
        progress: {
            onTodoProgress
        },
        // Prevent the agent from actually calling the model
        interruptOn: {
            "*": true,
        },
        systemPrompt: "You're expret assistant. Compose the todo list and show the effects of your action"
    });

    const finalState = await agent.invoke(
        {
            messages: [
                {
                    role: "user",
                    content: "First, add a todo to write a test. Then, add another todo to document it.",
                },
            ],
        },
        {
            recursionLimit: 50,
        }
    );

    // Completes the todo list with emission of TodoListDetectionEvents."finished-todo-list" (not always agent marks the todo list as completed so we have to do it manually)
    /// It'll trigger a "finished-todo-list" is listened above (Pretty handy huh?)
    detector.complete();
}
