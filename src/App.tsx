import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import moon from "./assets/images/icon-moon.svg";
import sun from "./assets/images/icon-sun.svg";
import cross from "./assets/images/icon-cross.svg";
import check from "./assets/images/icon-check.svg";
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
} from "@hello-pangea/dnd";

type Theme = "light" | "dark";
type TodoItm = {
    id: string;
    text: string;
    completed: boolean;
};
type Filter = "all" | "active" | "completed";

function App() {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem("themeSelection") as Theme) || "light";
    });
    const [todoItem, setTodoItem] = useState<TodoItm[]>(() => {
        const todos = localStorage.getItem("todoItems");
        return todos ? JSON.parse(todos) : [];
    });
    const [todoFtr, setTodoFtr] = useState<Filter>("all");

    useEffect(() => {
        localStorage.setItem("themeSelection", theme);
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    function themeToggle() {
        setTheme(theme === "light" ? "dark" : "light");
    }

    const filteredItems = todoItem.filter((item) =>
        todoFtr === "all"
            ? true
            : todoFtr === "active"
            ? !item.completed
            : todoFtr === "completed" && item.completed
    );

    const actTgl = (id: string) => {
        setTodoItem((prevTodo) =>
            prevTodo.map((item) => {
                return item.id === id
                    ? { ...item, completed: !item.completed }
                    : item;
            })
        );
    };

    const delItem = (id: string) => {
        setTodoItem((prevTodo) => prevTodo.filter((item) => item.id !== id));
    };

    const clearCompleted = () => {
        setTodoItem((prevTodo) =>
            prevTodo.filter((item) => item.completed === false)
        );
    };

    function filterMode(todoFilter: Filter) {
        setTodoFtr(todoFilter);
    }

    function addTodo(formData: FormData) {
        const input = formData.get("todo")?.toString().trim();
        if (!input) return;
        const toDo: TodoItm = {
            id: nanoid(),
            text: input,
            completed: false,
        };

        setTodoItem((prevTodo) => [...prevTodo, toDo]);
    }

    useEffect(() => {
        localStorage.setItem("todoItems", JSON.stringify(todoItem));
    }, [todoItem]);

    function handleDragEnd(result: DropResult) {
        if (!result.destination) return;
        const newItems = Array.from(todoItem);
        const [reorderedItems] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, reorderedItems);

        setTodoItem(newItems);
    }

    return (
        <>
            <header className="header">
                <nav className="header__nav container">
                    <h1 className="logo">TODO</h1>
                    <div className="theme">
                        {theme === "dark" && (
                            <button
                                type="button"
                                className="theme__btn"
                                onClick={themeToggle}
                            >
                                <img src={sun} alt="sun" />
                            </button>
                        )}
                        {theme === "light" && (
                            <button
                                type="button"
                                className="theme__btn"
                                onClick={themeToggle}
                            >
                                <img src={moon} alt="moon" />
                            </button>
                        )}
                    </div>
                </nav>
            </header>
            <main className="main container">
                <form className="input__con" action={addTodo}>
                    <input
                        type="text"
                        placeholder="Create a new todo..."
                        className="todo__input"
                        name="todo"
                    />
                    <div className="input__circle"></div>
                    <button type="submit" hidden aria-hidden="true"></button>
                </form>
                <section className="todo__main">
                    <div className="todo__list">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="todoItems">
                                {(provided) => (
                                    <ul
                                        className="todo__ul"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {todoItem.length > 0 ? (
                                            filteredItems.map((item, index) => (
                                                <Draggable
                                                    key={item.id}
                                                    draggableId={item.id}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <li
                                                            ref={
                                                                provided.innerRef
                                                            }
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`${
                                                                item.completed
                                                                    ? "done"
                                                                    : ""
                                                            } list__item`}
                                                        >
                                                            <span
                                                                className="check"
                                                                onClick={() =>
                                                                    actTgl(
                                                                        item.id
                                                                    )
                                                                }
                                                            >
                                                                <img
                                                                    src={check}
                                                                    alt="tick"
                                                                />
                                                            </span>
                                                            <span className="text">
                                                                {" "}
                                                                {item.text}
                                                            </span>
                                                            <span
                                                                className="cross"
                                                                onClick={() =>
                                                                    delItem(
                                                                        item.id
                                                                    )
                                                                }
                                                            >
                                                                <img
                                                                    src={cross}
                                                                    alt=""
                                                                />
                                                            </span>
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))
                                        ) : (
                                            <li className="empty__list">
                                                Your List is empty
                                            </li>
                                        )}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>

                        <div className="details">
                            <p>
                                <span className="item__count">
                                    {filteredItems.length === 0
                                        ? `${filteredItems.length} items left`
                                        : filteredItems.length === 1
                                        ? `${filteredItems.length} item left`
                                        : `${filteredItems.length} items left`}
                                </span>
                            </p>
                            <section className="filter__sec bg__only">
                                <ul className="filter">
                                    <li
                                        onClick={() => filterMode("all")}
                                        className={`filter__nav  ${
                                            todoFtr === "all" ? "selected" : ""
                                        }`}
                                    >
                                        All
                                    </li>
                                    <li
                                        onClick={() => filterMode("active")}
                                        className={`filter__nav  ${
                                            todoFtr === "active"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        Active
                                    </li>
                                    <li
                                        onClick={() => filterMode("completed")}
                                        className={`filter__nav  ${
                                            todoFtr === "completed"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        Completed
                                    </li>
                                </ul>
                            </section>
                            <p className="clear" onClick={clearCompleted}>
                                Clear completed
                            </p>
                        </div>
                    </div>
                </section>

                <section className="filter__sec sm__only">
                    <ul className="filter">
                        <li
                            onClick={() => filterMode("all")}
                            className={`filter__nav  ${
                                todoFtr === "all" ? "selected" : ""
                            }`}
                        >
                            All
                        </li>
                        <li
                            onClick={() => filterMode("active")}
                            className={`filter__nav  ${
                                todoFtr === "active" ? "selected" : ""
                            }`}
                        >
                            Active
                        </li>
                        <li
                            onClick={() => filterMode("completed")}
                            className={`filter__nav  ${
                                todoFtr === "completed" ? "selected" : ""
                            }`}
                        >
                            Completed
                        </li>
                    </ul>
                </section>
            </main>

            <p className="drag__text">Drag and drop to reorder list</p>

            <div className="attribution">
                Challenge by{" "}
                <a
                    href="https://www.frontendmentor.io?ref=challenge"
                    target="_blank"
                >
                    Frontend Mentor
                </a>
                . Coded by{" "}
                <a href="https://linktr.ee/didiauche" target="_blank">
                    Didia Uchenna
                </a>
                .
            </div>
        </>
    );
}

export default App;
