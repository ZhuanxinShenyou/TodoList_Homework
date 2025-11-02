// ==================== 变量声明区域 ====================
// 数据存储
let taskLists = []; // 所有任务列表
let currentListId = null; // 当前选中的任务列表ID
let currentTaskId = null; // 当前选中的任务ID
let nextListId = 1; // 下一个任务列表ID
let nextTaskId = 1; // 下一个任务ID
let nextStepId = 1; // 下一个步骤ID

// DOM元素引用
let listGroupEl;
let addListBtnEl;
let taskListEl;
let addTaskBtnEl;
let completedTasksEl;
let toggleCompletedBtnEl;
let completedCountEl;
let currentListTitleEl;
let detailPanelEl;
let taskNameTitleEl;
let stepListEl;
let addStepBtnEl;

// ==================== 初始化函数 ====================
/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    initDOMReferences();
    renderLists();
    bindEvents();
});

/**
 * 初始化DOM元素引用
 */
function initDOMReferences() {
    listGroupEl = document.getElementById('list-group');
    addListBtnEl = document.getElementById('add-list-btn');
    taskListEl = document.getElementById('task-list');
    addTaskBtnEl = document.getElementById('add-task-btn');
    completedTasksEl = document.getElementById('completed-tasks');
    toggleCompletedBtnEl = document.getElementById('toggle-completed');
    completedCountEl = document.getElementById('completed-count');
    currentListTitleEl = document.getElementById('current-list-title');
    detailPanelEl = document.getElementById('detail-panel');
    taskNameTitleEl = document.getElementById('task-name-title');
    stepListEl = document.getElementById('step-list');
    addStepBtnEl = document.getElementById('add-step-btn');
}

/**
 * 绑定所有事件监听器
 */
function bindEvents() {
    // 添加列表按钮
    addListBtnEl.addEventListener('click', handleAddList);
    
    // 添加任务按钮
    addTaskBtnEl.addEventListener('click', handleAddTask);
    
    // 切换已完成显示
    toggleCompletedBtnEl.addEventListener('click', handleToggleCompleted);
    
    // 添加步骤按钮
    addStepBtnEl.addEventListener('click', handleAddStep);
}

// ==================== 任务列表相关函数 ====================
/**
 * 渲染所有任务列表
 */
function renderLists() {
    listGroupEl.innerHTML = '';
    taskLists.forEach(list => {
        const listItem = createListElement(list);
        listGroupEl.appendChild(listItem);
    });
}

/**
 * 创建任务列表DOM元素
 */
function createListElement(list) {
    const li = document.createElement('li');
    li.dataset.listId = list.id;
    if (currentListId === list.id) {
        li.classList.add('active');
    }
    
    // SVG图标
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('viewBox', '0 0 1024 1024');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M288.448 613.312A32.224 32.224 0 0 1 288 608v-192c0-1.824 0.16-3.584 0.448-5.312A96.032 96.032 0 0 1 320 224a96 96 0 0 1 31.552 186.688c0.32 1.728 0.448 3.52 0.448 5.312v192c0 1.824-0.16 3.584-0.448 5.312A96.032 96.032 0 0 1 320 800a96 96 0 0 1-31.552-186.688zM768 352h-256a32 32 0 1 1 0-64h256a32 32 0 0 1 0 64z m0 192h-192a32 32 0 0 1 0-64h192a32 32 0 0 1 0 64z m0 192h-256a32 32 0 0 1 0-64h256a32 32 0 0 1 0 64z m-448-64a32 32 0 1 0 0 64 32 32 0 0 0 0-64z m0-384a32 32 0 1 0 0 64 32 32 0 0 0 0-64z');
    path.setAttribute('fill', '#202425');
    svg.appendChild(path);
    
    // 文本容器
    const textSpan = document.createElement('span');
    textSpan.textContent = list.name;
    textSpan.className = 'list-name-text';
    textSpan.contentEditable = false;
    
    li.appendChild(svg);
    li.appendChild(textSpan);
    
    // 事件监听
    li.addEventListener('click', () => handleSelectList(list.id));
    textSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        handleEditListName(list.id, textSpan);
    });
    textSpan.addEventListener('blur', () => {
        handleSaveListName(list.id, textSpan);
    });
    textSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            textSpan.blur();
        }
    });
    
    // 右键删除
    li.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        handleDeleteList(list.id);
    });
    
    return li;
}

/**
 * 添加新任务列表
 */
function handleAddList() {
    const newList = {
        id: nextListId++,
        name: '新建列表',
        tasks: [],
        completedTasks: []
    };
    taskLists.push(newList);
    renderLists();
    handleSelectList(newList.id);
}

/**
 * 选择任务列表
 */
function handleSelectList(listId) {
    currentListId = listId;
    currentTaskId = null;
    renderLists();
    renderTasks();
    
    // 显示添加任务按钮和已完成按钮
    addTaskBtnEl.style.display = 'flex';
    toggleCompletedBtnEl.style.display = 'flex';
    
    // 更新标题
    const list = taskLists.find(l => l.id === listId);
    if (list) {
        currentListTitleEl.textContent = list.name;
    }
}

/**
 * 编辑列表名称
 */
function handleEditListName(listId, element) {
    element.contentEditable = true;
    element.focus();
    // 选中全部文本
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

/**
 * 保存列表名称
 */
function handleSaveListName(listId, element) {
    element.contentEditable = false;
    const newName = element.textContent.trim();
    if (newName) {
        const list = taskLists.find(l => l.id === listId);
        if (list) {
            list.name = newName;
            if (currentListId === listId) {
                currentListTitleEl.textContent = newName;
            }
        }
    } else {
        // 如果名称为空，恢复原名称
        const list = taskLists.find(l => l.id === listId);
        if (list) {
            element.textContent = list.name;
        }
    }
}

/**
 * 删除任务列表（右键）
 */
function handleDeleteList(listId) {
    taskLists = taskLists.filter(l => l.id !== listId);
    if (currentListId === listId) {
        currentListId = null;
        currentTaskId = null;
        taskListEl.innerHTML = '';
        completedTasksEl.innerHTML = '';
        currentListTitleEl.textContent = '请选择任务列表';
        addTaskBtnEl.style.display = 'none';
        toggleCompletedBtnEl.style.display = 'none';
    }
    renderLists();
}

// ==================== 任务相关函数 ====================
/**
 * 渲染任务
 */
function renderTasks() {
    if (!currentListId) return;
    
    const list = taskLists.find(l => l.id === currentListId);
    if (!list) return;
    
    // 渲染未完成任务
    taskListEl.innerHTML = '';
    list.tasks.forEach(task => {
        const taskItem = createTaskElement(task, false);
        taskListEl.appendChild(taskItem);
    });
    
    // 渲染已完成任务
    completedTasksEl.innerHTML = '';
    list.completedTasks.forEach(task => {
        const taskItem = createTaskElement(task, true);
        completedTasksEl.appendChild(taskItem);
    });
    
    // 更新已完成数量
    completedCountEl.textContent = list.completedTasks.length;
}

/**
 * 创建任务DOM元素
 */
function createTaskElement(task, isCompleted) {
    const li = document.createElement('li');
    li.className = isCompleted ? 'completed-task-item' : 'task-item';
    li.dataset.taskId = task.id;
    
    // 复选框
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = isCompleted;
    checkbox.addEventListener('change', () => {
        handleToggleTaskComplete(task.id, isCompleted);
    });
    
    // 文本
    const span = document.createElement('span');
    span.textContent = task.name;
    span.contentEditable = false;
    
    li.appendChild(checkbox);
    li.appendChild(span);
    
    // 点击任务显示步骤
    if (!isCompleted) {
        li.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                handleSelectTask(task.id);
            }
        });
    }
    
    // 点击文本编辑
    span.addEventListener('click', (e) => {
        e.stopPropagation();
        handleEditTaskName(task.id, span, isCompleted);
    });
    span.addEventListener('blur', () => {
        handleSaveTaskName(task.id, span, isCompleted);
    });
    span.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            span.blur();
        }
    });
    
    // 右键删除
    li.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        handleDeleteTask(task.id, isCompleted);
    });
    
    return li;
}

/**
 * 添加新任务
 */
function handleAddTask() {
    if (!currentListId) return;
    
    const list = taskLists.find(l => l.id === currentListId);
    if (!list) return;
    
    const newTask = {
        id: nextTaskId++,
        name: '新建任务',
        steps: []
    };
    list.tasks.push(newTask);
    renderTasks();
}

/**
 * 选择任务（显示步骤）
 */
function handleSelectTask(taskId) {
    currentTaskId = taskId;
    const list = taskLists.find(l => l.id === currentListId);
    if (!list) return;
    
    const task = list.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    taskNameTitleEl.textContent = task.name;
    renderSteps();
}

/**
 * 切换任务完成状态
 */
function handleToggleTaskComplete(taskId, wasCompleted) {
    const list = taskLists.find(l => l.id === currentListId);
    if (!list) return;
    
    if (wasCompleted) {
        // 从已完成移回未完成
        const taskIndex = list.completedTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const task = list.completedTasks.splice(taskIndex, 1)[0];
            list.tasks.push(task);
        }
    } else {
        // 从未完成移到已完成
        const taskIndex = list.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const task = list.tasks.splice(taskIndex, 1)[0];
            list.completedTasks.push(task);
            // 如果当前正在查看这个任务的步骤，清除选择
            if (currentTaskId === taskId) {
                currentTaskId = null;
            }
        }
    }
    
    renderTasks();
}

/**
 * 编辑任务名称
 */
function handleEditTaskName(taskId, element, isCompleted) {
    element.contentEditable = true;
    element.focus();
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

/**
 * 保存任务名称
 */
function handleSaveTaskName(taskId, element, isCompleted) {
    element.contentEditable = false;
    const newName = element.textContent.trim();
    
    const list = taskLists.find(l => l.id === currentListId);
    if (!list) return;
    
    const taskArray = isCompleted ? list.completedTasks : list.tasks;
    const task = taskArray.find(t => t.id === taskId);
    
    if (task) {
        if (newName) {
            task.name = newName;
            if (currentTaskId === taskId) {
                taskNameTitleEl.textContent = newName;
            }
        } else {
            element.textContent = task.name;
        }
    }
}

/**
 * 删除任务（右键）
 */
function handleDeleteTask(taskId, isCompleted) {
    const list = taskLists.find(l => l.id === currentListId);
    if (!list) return;
    
    if (isCompleted) {
        list.completedTasks = list.completedTasks.filter(t => t.id !== taskId);
    } else {
        list.tasks = list.tasks.filter(t => t.id !== taskId);
        if (currentTaskId === taskId) {
            currentTaskId = null;
        }
    }
    
    renderTasks();
}

/**
 * 切换已完成任务显示/隐藏
 */
function handleToggleCompleted() {
    completedTasksEl.classList.toggle('hidden');
    const arrow = toggleCompletedBtnEl.querySelector('.arrow');
    if (completedTasksEl.classList.contains('hidden')) {
        arrow.textContent = '▶';
    } else {
        arrow.textContent = '▼';
    }
}

// ==================== 步骤相关函数 ====================
/**
 * 渲染步骤
 */
function renderSteps() {
    if (!currentListId || !currentTaskId) return;
    
    const list = taskLists.find(l => l.id === currentListId);
    if (!list) return;
    
    const task = list.tasks.find(t => t.id === currentTaskId);
    if (!task) return;
    
    stepListEl.innerHTML = '';
    task.steps.forEach(step => {
        const stepItem = createStepElement(step);
        stepListEl.appendChild(stepItem);
    });
}

/**
 * 创建步骤DOM元素
 */
function createStepElement(step) {
    const li = document.createElement('li');
    li.className = 'step-item';
    li.dataset.stepId = step.id;
    
    // 复选框
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'step-checkbox';
    checkbox.addEventListener('change', () => {
        handleDeleteStep(step.id);
    });
    
    // 文本
    const span = document.createElement('span');
    span.textContent = step.name;
    span.contentEditable = false;
    
    li.appendChild(checkbox);
    li.appendChild(span);
    
    // 点击文本编辑
    span.addEventListener('click', (e) => {
        e.stopPropagation();
        handleEditStepName(step.id, span);
    });
    span.addEventListener('blur', () => {
        handleSaveStepName(step.id, span);
    });
    span.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            span.blur();
        }
    });
    
    // 右键删除
    li.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        handleDeleteStep(step.id);
    });
    
    return li;
}

/**
 * 添加新步骤
 */
function handleAddStep() {
    if (!currentListId || !currentTaskId) return;
    
    const list = taskLists.find(l => l.id === currentListId);
    if (!list) return;
    
    const task = list.tasks.find(t => t.id === currentTaskId);
    if (!task) return;
    
    const newStep = {
        id: nextStepId++,
        name: '新建步骤'
    };
    task.steps.push(newStep);
    renderSteps();
}

/**
 * 编辑步骤名称
 */
function handleEditStepName(stepId, element) {
    element.contentEditable = true;
    element.focus();
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

/**
 * 保存步骤名称
 */
function handleSaveStepName(stepId, element) {
    element.contentEditable = false;
    const newName = element.textContent.trim();
    
    const list = taskLists.find(l => l.id === currentListId);
    if (!list) return;
    
    const task = list.tasks.find(t => t.id === currentTaskId);
    if (!task) return;
    
    const step = task.steps.find(s => s.id === stepId);
    if (step) {
        if (newName) {
            step.name = newName;
        } else {
            element.textContent = step.name;
        }
    }
}

/**
 * 删除步骤（勾选或右键）
 */
function handleDeleteStep(stepId) {
    if (!currentListId || !currentTaskId) return;
    
    const list = taskLists.find(l => l.id === currentListId);
    if (!list) return;
    
    const task = list.tasks.find(t => t.id === currentTaskId);
    if (!task) return;
    
    task.steps = task.steps.filter(s => s.id !== stepId);
    renderSteps();
}
