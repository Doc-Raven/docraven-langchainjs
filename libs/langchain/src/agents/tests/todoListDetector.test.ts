import { TodoListEventsDetector, type TodoListDetectionEvents } from "../todoListDetector";
import _ from "lodash";

describe("Todo Changes detection mechanism", () => {
  describe("Direct behaviour testing", () => {
    let detector = new TodoListEventsDetector();

    // Registers detectoon
    const falsyRegister: Record<TodoListDetectionEvents, boolean> = {
        "created-todo-list": false,
        "state-updation-todo-list": false,
        "changed-todo-list-point": false,
        "new-element-todo-list": false,
        "finished-todo-list": false
    }
    let eventsRegister: Record<TodoListDetectionEvents, boolean> = {
        ...falsyRegister
    };

    beforeEach(() => {
      detector = new TodoListEventsDetector();
      eventsRegister = {
        ...falsyRegister
      }
    })
    
    it("Shouldn't register empty list detection for detector initialized without todos", () => {
      detector.listen("created-todo-list", () => {
        eventsRegister["created-todo-list"] = true;
      })

      detector.listen("state-updation-todo-list", () => {
        eventsRegister["state-updation-todo-list"] = true;
      })

      detector.listen("changed-todo-list-point", () => {
        eventsRegister["changed-todo-list-point"] = true;
      })
      
      detector.listen("new-element-todo-list", () => {
        eventsRegister["new-element-todo-list"] = true;
      })
      
      detector.listen("finished-todo-list", () => {
        eventsRegister["finished-todo-list"] = true;
      })
      
      detector.detect([]);

      expect(_.isEqual(eventsRegister, falsyRegister)).toBeTruthy();
    })
    
    it("Should reigsister #creation event", () => {
      detector.listen("created-todo-list", () => {
        eventsRegister["created-todo-list"] = true;
      })

      detector.detect([
        {
          content: "todo-pin",
          status: "pending"
        }
      ]);

      const expectations: Record<TodoListDetectionEvents, boolean> = {
        ...falsyRegister,
        "created-todo-list": true
      };
      expect(_.isEqual(eventsRegister, expectations)).toBeTruthy();
    })

    it("Should reigsister #state-updation event", () => {
      detector = new TodoListEventsDetector([
        {
          content: "todo-pin",
          status: "pending"
        }
      ]);

      detector.listen("state-updation-todo-list", () => {
        eventsRegister["state-updation-todo-list"] = true;
      });

      const changedList = [
        {
          content: "todo-pin",
          status: "completed"
        }
      ];
      detector.detect(changedList)

      const expectations: Record<TodoListDetectionEvents, boolean> = {
        ...falsyRegister,
        "state-updation-todo-list": true,
      };
      expect(_.isEqual(eventsRegister, expectations)).toBeTruthy();
    })

    it("Should reigsister #changed-point-content event", () => {
        detector = new TodoListEventsDetector([
            {
                content: "todo-pin",
                status: "pending"
            }
        ]);

        detector.listen("changed-todo-list-point", () => {
            eventsRegister["changed-todo-list-point"] = true;
        });
        
        const changedList = [
            {
                content: "todo-pin-#change",
                status: "completed"
            }
        ];
        detector.detect(changedList)
        
        const expectations = {
            ...falsyRegister,
            "changed-todo-list-point": true
        };
        expect(_.isEqual(eventsRegister, expectations)).toBeTruthy();
    })

    it("Should reigsister #new-element event", () => {
        const baseList = [
            {
                content: "todo-pin",
                status: "pending"
            }
        ];
        detector = new TodoListEventsDetector(baseList);

        detector.listen("new-element-todo-list", () => {
            eventsRegister["new-element-todo-list"] = true;
        });
        detector.detect([
            ...baseList,
            {
                content: "todo-pin-#2",
                status: "pedning"
            }
        ])

        const expectations: Record<TodoListDetectionEvents, boolean> = {
            ...falsyRegister,
            "new-element-todo-list": true
        };
        expect(_.isEqual(eventsRegister, expectations)).toBeTruthy();
    })

    it("Should reigsister #finished event", () => {
        detector = new TodoListEventsDetector([
            {
                content: "todo-pin",
                status: "pending"
            }
        ]);

        detector.listen("finished-todo-list", () => {
            eventsRegister["finished-todo-list"] = true;
        });
        detector.detect([
            {
                content: "todo-pin",
                status: "completed"
            }
        ])

        const expectations: Record<TodoListDetectionEvents, boolean> = {
            ...falsyRegister,
            "finished-todo-list": true,
        };
        expect(_.isEqual(eventsRegister, expectations)).toBeTruthy();
    })

    it("Should register flow of events", () => {
        detector = new TodoListEventsDetector([
            {
                content: "todo-pin-2",
                status: "pending"
            }
        ], () => { // creation
            eventsRegister["created-todo-list"] = true
        })

        detector.listen("new-element-todo-list", () => {
            eventsRegister["new-element-todo-list"] = true;
        })

        detector.listen("changed-todo-list-point", () => {
            eventsRegister["changed-todo-list-point"] = true;
        })

        detector.listen("state-updation-todo-list", () => {
            eventsRegister["state-updation-todo-list"] = true;
        })

        detector.listen("finished-todo-list", () => {
            eventsRegister["finished-todo-list"] = true;
        })

        // Updation: state updation and new element added
        detector.detect([
            {
                content: 'todo-pin-2-change',
                status: "completed"
            },
            {
                content: "todo-pin-3-change",
                status: "in_progress"
            }
        ])

        // Completion list
        detector.detect([
            {
                content: 'todo-pin-2-change',
                status: "completed"
            },
            {
                content: "todo-pin-3-change",
                status: "completed"
            }
        ])
        
        const expectations = Object.fromEntries(
            Object.entries(falsyRegister).map(([k, v]) => [k, true])
        );
        expect(_.isEqual(eventsRegister, expectations)).toBeTruthy();
    });
  })
})
