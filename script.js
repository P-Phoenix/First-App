// 1. Task Data
let tasks = [];
let currentFilter = 'all'; // 1. Filter State

// 2. DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const prioritySelect = document.getElementById('prioritySelect'); // Priority select
const allFilterBtn = document.getElementById('allFilter'); // Filter buttons
const activeFilterBtn = document.getElementById('activeFilter');
const completedFilterBtn = document.getElementById('completedFilter');
const activeTasksCounter = document.getElementById('activeTasksCounter'); // Active task counter
const clearCompletedBtn = document.getElementById('clearCompletedBtn'); // Clear completed button

// 7. Local Storage - Load tasks initially
loadTasks(); // This will call renderTasks, which will use currentFilter

// 3. Render Tasks
function renderTasks() {
    taskList.innerHTML = ''; // Clear existing tasks
    updateFilterButtonsUI(); // Update button styles

    // Active Task Counter Logic
    const activeTasks = tasks.filter(task => !task.completed).length;
    activeTasksCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} remaining`;

    // Visibility of "Clear Completed Tasks" Button
    const completedTasksExist = tasks.some(task => task.completed);
    if (completedTasksExist) {
        clearCompletedBtn.style.display = 'inline-block'; // Or 'block' depending on desired layout
    } else {
        clearCompletedBtn.style.display = 'none';
    }

    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    // If 'all', no change to filteredTasks, it uses the full 'tasks' array.

    filteredTasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.classList.add(`priority-${task.priority || 'medium'}`); // Add priority class

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleComplete(task.id));

        // Task text
        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        if (task.completed) {
            listItem.classList.add('completed');
        }

        // Priority indicator (optional, if not using borders or backgrounds directly)
        // const priorityIndicator = document.createElement('span');
        // priorityIndicator.classList.add('priority-indicator', `priority-${task.priority}`);
        // priorityIndicator.textContent = `[${task.priority}]`; // Simple text indicator

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => removeTask(task.id));

        listItem.appendChild(checkbox);
        listItem.appendChild(taskText);
        listItem.appendChild(removeBtn);
        taskList.appendChild(listItem);
    });
    saveTasks(); // Save tasks whenever they are re-rendered
}

// 4. Add Task
addTaskBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    const priority = prioritySelect.value; // Get priority
    if (text !== '') {
        const newTask = {
            id: Date.now(), // Unique ID
            text: text,
            completed: false,
            priority: priority // Store priority
        };
        tasks.push(newTask);
        // If the current filter is 'completed', adding a new (active) task
        // shouldn't make it disappear. Switch to 'all' or 'active'.
        // For simplicity, let's switch to 'all' to ensure the new task is visible.
        if (currentFilter === 'completed') {
            currentFilter = 'all';
        }
        renderTasks();
        taskInput.value = ''; // Clear input
    }
});

// 5. Toggle Complete
function toggleComplete(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    // If a task's completion status changes, it might affect its visibility
    // under 'active' or 'completed' filters. Re-rendering will handle this.
    renderTasks();
}

// 6. Remove Task
function removeTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
}

// 7. Local Storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    // currentFilter is already 'all' by default.
    renderTasks(); // Render tasks after loading, respecting the current filter
}

// Filter Button Event Listeners
allFilterBtn.addEventListener('click', () => {
    currentFilter = 'all';
    renderTasks();
});

activeFilterBtn.addEventListener('click', () => {
    currentFilter = 'active';
    renderTasks();
});

completedFilterBtn.addEventListener('click', () => {
    currentFilter = 'completed';
    renderTasks();
});

function updateFilterButtonsUI() {
    allFilterBtn.classList.remove('active');
    activeFilterBtn.classList.remove('active');
    completedFilterBtn.classList.remove('active');

    if (currentFilter === 'all') {
        allFilterBtn.classList.add('active');
    } else if (currentFilter === 'active') {
        activeFilterBtn.classList.add('active');
    } else if (currentFilter === 'completed') {
        completedFilterBtn.classList.add('active');
    }
}

// Ensure initial UI state for buttons is correct
// loadTasks calls renderTasks, which calls updateFilterButtonsUI.
// No need for an explicit call here if loadTasks is guaranteed to run.
// However, if tasks were empty and loadTasks didn't trigger a re-render
// that called updateFilterButtonsUI, we might need it.
// The existing structure where loadTasks calls renderTasks seems sufficient.

// The initial render call if tasks array was empty after loadTasks
// is no longer strictly necessary here as loadTasks itself calls renderTasks.
// if (tasks.length === 0 && !localStorage.getItem('tasks')) { // More precise condition
//    renderTasks(); // This will also call updateFilterButtonsUI
// }
// Actually, renderTasks() is called inside loadTasks() unconditionally, so this is fine.

// "Clear Completed Tasks" Button Logic
clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    renderTasks(); // This will also call saveTasks()
});
