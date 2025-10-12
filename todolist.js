const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

function render() {
    taskList.innerHTML = '';

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'task-item';
        
        if (todo.completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <span class="task-text">${todo.text}</span>
            <div class="actions">
                <button class="toggle-btn">✔</button>
                <button class="delete-btn">✖</button>
            </div>
        `;
        
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(todo.id));

        const toggleBtn = li.querySelector('.toggle-btn');
        toggleBtn.addEventListener('click', () => toggleTask(todo.id));

        taskList.appendChild(li);
    });
}

function saveData() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function addTask() {
    const taskText = taskInput.value.trim(); 
    if (taskText === '') {
        alert('任务内容不能为空！');
        return;
    }

    const newTask = {
        id: Date.now(), 
        text: taskText,
        completed: false
    };


    todos.push(newTask);

    saveData();
    render();

    taskInput.value = '';
}

function deleteTask(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveData();
    render();
}

function toggleTask(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;

        saveData();
        render();
    }
}

addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});
render();