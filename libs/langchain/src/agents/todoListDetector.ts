import { TodoSchemaType } from "./middleware/todoListMiddleware";

export type TodoListDetectionEvents = "created-todo-list" | "state-updation-todo-list" | "changed-todo-list-point" | "new-element-todo-list" | "finished-todo-list";

type EventsListener = (todo: TodoSchemaType[]) => Promise<void> | void;

/**
 * Is prepared to be used in onProgress function of todo middleware params
 */
export class TodoListEventsDetector {
  baseTodoList: TodoSchemaType[] = [];
  private listeners: Map<TodoListDetectionEvents, Set<EventsListener>> = new Map();
  
  /**
   * @description If list is pasted with value is emitted the **onceCreationListener** a listen "created-todo-list" event will have not been initialized then
   * @event "created-todo-list" is emit for non-empty base list passed to constructor
   * @param baseTodoList 
   * @param onceCreationListener - is the listener of creation event called if baseTodoList was passed with some value
   */
  constructor(baseTodoList?: TodoSchemaType[], onceCreationListener?: EventsListener) {
    if (baseTodoList) {
      this.baseTodoList = baseTodoList;

      // Calls once-listener for creation event
      if (this.baseTodoList.length && onceCreationListener) {
        onceCreationListener(this.baseTodoList);
      }
    }
  }

  /**
   * Compares the existsing todo points on baseTodoList to new ones and emits event according to kind of detected change
   * Separate event is emitted for each new detected change
   * Updates the baseTodoList after detection assigning todos as replacement
   * @param todos 
   */
  detect(todos: TodoSchemaType[]) {
    // Check if this is the first todo list creation
    if (this.baseTodoList.length === 0 && todos.length > 0) {
      this.emit("created-todo-list", todos);
    }

    // Detect state updates and new elements
    for (let i = 0; i < todos.length; i++) {
      const newTodo = todos[i];
      const baseTodo = this.baseTodoList[i];

      if (!baseTodo) {
        // New element added
        this.emit("new-element-todo-list", todos);
        continue;
      }
      
      if (baseTodo.status !== newTodo.status) {
        // State updated (status changed)
        this.emit("state-updation-todo-list", todos);
      }

      if (baseTodo.content !== newTodo.content) {
        // Content updated (changed point)
        this.emit("changed-todo-list-point", todos);
      }
    }

    // Check if all todos are completed
    if (todos.length > 0 && todos.every(t => t.status === "completed")) {
      this.emit("finished-todo-list", todos);
    }

    // Updates base list
    this.baseTodoList = todos;
  }

  /**
   * Listens changes detected on list for this TodoListEventsDetector instance, has to be invoked before detect funcition call
   * @param event 
  */
  listen(event: TodoListDetectionEvents, callback: EventsListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Removes a listener for a specific event
   * @param event 
   * @param callback 
   */
  unlisten(event: TodoListDetectionEvents, callback: EventsListener) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  /**
   * Emits an event to all registered listeners
   * @param event 
   * @param todos 
   */
  private emit(event: TodoListDetectionEvents, todos: TodoSchemaType[]) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(todos));
    }
  }
}
