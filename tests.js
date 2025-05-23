// Helper Function for Assertions
function runTest(testName, testFunction) {
    const resultsDiv = document.getElementById('testResults');
    const resultP = document.createElement('p');
    try {
        testFunction();
        resultP.textContent = `PASS: ${testName}`;
        resultP.style.color = 'green';
    } catch (e) {
        resultP.textContent = `FAIL: ${testName} - ${e.message}`;
        resultP.style.color = 'red';
        console.error(`Test Failed: ${testName}`, e);
    }
    resultsDiv.appendChild(resultP);
}

function assertEquals(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message} | Expected "${expected}", but got "${actual}"`);
    }
}

function assertDeepEquals(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${message} | Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
    }
}

function assertTrue(condition, message) {
   if (!condition) {
       throw new Error(`${message} | Expected true, but got false`);
   }
}

// Simplified Test Setup Function
function setupBeforeEachTest() {
    // Reset tasks array and local storage before each test
    tasks = [];
    localStorage.clear();
    currentFilter = 'all'; // Reset filter

    // Clear relevant parts of the DOM programmatically
    const taskListEl = document.getElementById('taskList');
    if (taskListEl) {
        taskListEl.innerHTML = '';
    }
    const taskInputEl = document.getElementById('taskInput');
    if (taskInputEl) {
        taskInputEl.value = '';
    }
    const prioritySelectEl = document.getElementById('prioritySelect');
    if (prioritySelectEl) {
        prioritySelectEl.value = 'medium'; // Default
    }
    const activeTasksCounterEl = document.getElementById('activeTasksCounter');
    if (activeTasksCounterEl) {
        activeTasksCounterEl.textContent = '0 tasks remaining'; // Reset to default
    }
    const clearCompletedBtnEl = document.getElementById('clearCompletedBtn');
    if (clearCompletedBtnEl) {
        clearCompletedBtnEl.style.display = 'none'; // Default hidden
    }
    
    // Ensure filter buttons are reset (active class)
    const filterButtonIds = ['allFilter', 'activeFilter', 'completedFilter'];
    filterButtonIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.remove('active');
        }
    });
    // 'loadTasks' will call 'renderTasks' which calls 'updateFilterButtonsUI' to set the default active filter.

    // Call loadTasks() to initialize tasks array from (empty) localStorage and
    // to perform initial render. script.js's global DOM element variables 
    // (taskInput, taskList, etc.) are assumed to be initialized when test-runner.html loads script.js.
    loadTasks(); 
}


// Execute all tests when the window loads
window.onload = () => {
    // Test for adding a task
    runTest('Add a new task', () => {
        setupBeforeEachTest();
        // DOM elements are accessed via globals from script.js
        taskInput.value = 'Test Task 1';
        prioritySelect.value = 'high';
        addTaskBtn.click(); // Simulates the add task button click

        assertEquals(tasks.length, 1, 'Tasks array should have 1 task');
        assertEquals(tasks[0].text, 'Test Task 1', 'Task text incorrect');
        assertEquals(tasks[0].priority, 'high', 'Task priority incorrect');
        assertTrue(!tasks[0].completed, 'New task should not be completed');
        assertEquals(tasks[0].id !== undefined, true, "Task should have an ID"); // Adjusted for assertEquals
    });

    // Test for completing a task
    runTest('Complete a task', () => {
        setupBeforeEachTest();
        taskInput.value = 'Test Task for Completion';
        prioritySelect.value = 'medium';
        addTaskBtn.click();
        
        assertTrue(tasks.length === 1, "Task should be added before toggling completion");
        toggleComplete(tasks[0].id);
        assertTrue(tasks[0].completed, 'Task should be marked as completed');

        toggleComplete(tasks[0].id);
        assertTrue(!tasks[0].completed, 'Task should be marked as not completed after toggling again');
    });

    // Test for deleting a task
    runTest('Delete a task', () => {
        setupBeforeEachTest();
        taskInput.value = 'Task to delete';
        prioritySelect.value = 'low';
        addTaskBtn.click();

        taskInput.value = 'Task to keep';
        prioritySelect.value = 'medium';
        addTaskBtn.click();
        
        assertEquals(tasks.length, 2, 'Should have two tasks before deletion');
        removeTask(tasks[0].id);
        assertEquals(tasks.length, 1, 'Tasks array should have 1 task after deletion');
        assertEquals(tasks[0].text, 'Task to keep', 'Incorrect task remaining');
    });

    // Test local storage
    runTest('Save and load tasks from local storage', () => {
        setupBeforeEachTest();
        taskInput.value = 'Persistent Task';
        prioritySelect.value = 'low';
        addTaskBtn.click();
        // saveTasks() is called within renderTasks(), which is called by addTaskBtn.click()

        let saved = JSON.parse(localStorage.getItem('tasks'));
        assertEquals(saved.length, 1, 'Task not saved to localStorage correctly');
        assertEquals(saved[0].text, 'Persistent Task', 'Saved task text mismatch');
        assertEquals(saved[0].priority, 'low', 'Saved task priority mismatch');

        tasks = []; // Clear memory
        loadTasks(); // Load from storage
        assertEquals(tasks.length, 1, 'Task not loaded from localStorage correctly');
        assertEquals(tasks[0].text, 'Persistent Task', 'Loaded task text mismatch');
        assertEquals(tasks[0].priority, 'low', 'Loaded task priority mismatch');
    });

    // Test filtering (active tasks)
    runTest('Filter for active tasks', () => {
        setupBeforeEachTest();
        taskInput.value = 'Active Task 1'; prioritySelect.value = 'medium'; addTaskBtn.click();
        taskInput.value = 'Completed Task 1'; prioritySelect.value = 'high'; addTaskBtn.click();
        toggleComplete(tasks[1].id); // Complete the second task
        taskInput.value = 'Active Task 2'; prioritySelect.value = 'low'; addTaskBtn.click();
        
        activeFilterBtn.click(); // Click active filter
        // renderTasks is called, which updates the counter
        const counterText = document.getElementById('activeTasksCounter').textContent;
        assertTrue(counterText.includes('2 tasks remaining'), `Expected counter to show '2 tasks remaining', got '${counterText}'`);
        assertEquals(document.getElementById('taskList').children.length, 2, "Number of displayed active tasks is incorrect");
    });
    
    // Test filtering (completed tasks)
    runTest('Filter for completed tasks', () => {
        setupBeforeEachTest();
        taskInput.value = 'Active Task 1'; prioritySelect.value = 'medium'; addTaskBtn.click();
        taskInput.value = 'Completed Task 1'; prioritySelect.value = 'high'; addTaskBtn.click();
        toggleComplete(tasks[1].id); // Complete the second task
        taskInput.value = 'Completed Task 2'; prioritySelect.value = 'low'; addTaskBtn.click();
        toggleComplete(tasks[2].id); // Complete the third task
        
        completedFilterBtn.click(); // Click completed filter
        assertEquals(document.getElementById('taskList').children.length, 2, "Number of displayed completed tasks is incorrect");
        const counterText = document.getElementById('activeTasksCounter').textContent;
        assertTrue(counterText.includes('1 task remaining'), `Expected counter to show '1 task remaining' for active, got '${counterText}'`);
    });

    // Test Clear Completed Tasks
    runTest('Clear completed tasks', () => {
        setupBeforeEachTest();
        taskInput.value = 'Active Task 1'; prioritySelect.value = 'medium'; addTaskBtn.click(); // tasks[0]
        taskInput.value = 'Completed Task 1'; prioritySelect.value = 'high'; addTaskBtn.click(); // tasks[1]
        toggleComplete(tasks[1].id);
        taskInput.value = 'Completed Task 2'; prioritySelect.value = 'low'; addTaskBtn.click(); // tasks[2]
        toggleComplete(tasks[2].id);

        assertEquals(tasks.length, 3, 'Should be 3 tasks before clearing');
        clearCompletedBtn.click();
        assertEquals(tasks.length, 1, 'Should be 1 active task remaining');
        assertEquals(tasks[0].text, 'Active Task 1', 'Incorrect task remaining after clear');
        assertTrue(!tasks[0].completed, 'Remaining task should be active');
        const counterText = document.getElementById('activeTasksCounter').textContent;
        assertTrue(counterText.includes('1 task remaining'), "Active task counter incorrect after clearing completed");
        assertTrue(document.getElementById('clearCompletedBtn').style.display === 'none', "'Clear Completed' button should be hidden");
    });
};
