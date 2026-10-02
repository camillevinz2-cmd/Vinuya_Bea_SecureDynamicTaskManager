

const data = (() => {
  let nextTaskId = 1;

  const getNextTaskId = () => `task-${nextTaskId++}`;

  const sampleTasks = [
    'Review DOM selectors',
    'Practice createElement',
    'Study event delegation'
  ];

  const messages = {
    EMPTY: 'Task cannot be empty'
  };

  return { getNextTaskId, sampleTasks, messages };
})();


const utils = (() => {
  const isValidTaskText = (text) =>
    typeof text === 'string' && text.trim().length > 0;

  const normalizeText = (text) => text.trim();

  return { isValidTaskText, normalizeText };
})();


const display = (() => {

  function createTaskElement(taskText, taskId) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.taskId = taskId;
    li.dataset.state = 'pending';

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = taskText;             // safe: no innerHTML

    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn';
    completeBtn.textContent = 'Complete';

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';

    li.append(span, completeBtn, editBtn, removeBtn);
    return li;
  }

  function buildSampleFragment(sampleTexts) {
    const fragment = document.createDocumentFragment();
    sampleTexts.forEach((text) => {
      fragment.append(createTaskElement(text, data.getNextTaskId()));
    });
    return fragment;
  }


  function updateTaskCounts(taskList, totalEl, pendingEl, completedEl) {
    const tasks = taskList.querySelectorAll('.task-item');
    let pending = 0;
    let completed = 0;

    tasks.forEach(({ dataset }) => {
      if (dataset.state === 'completed') completed++;
      else pending++;
    });

    totalEl.textContent = String(tasks.length);
    pendingEl.textContent = String(pending);
    completedEl.textContent = String(completed);
  }

  function showEditInput(taskItem) {
    const span = taskItem.querySelector('.task-text');
    const editBtn = taskItem.querySelector('.edit-btn');
    if (!span || !editBtn) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = span.textContent;

    span.replaceWith(input);
    editBtn.textContent = 'Save';
    input.focus();
  }


  function commitEdit(taskItem, newText) {
    const input = taskItem.querySelector('.edit-input');
    const editBtn = taskItem.querySelector('.edit-btn');
    if (!input || !editBtn) return;

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = newText;             

    input.replaceWith(span);
    editBtn.textContent = 'Edit';
  }

  return {
    createTaskElement,
    buildSampleFragment,
    updateTaskCounts,
    showEditInput,
    commitEdit
  };
})();


(() => {

  const {
    taskInput,
    addTaskBtn,
    loadSamplesBtn,
    taskList,
    taskMessage,
    totalCount,
    pendingCount,
    completedCount
  } = {
    taskInput:     document.getElementById('taskInput'),
    addTaskBtn:    document.getElementById('addTaskBtn'),
    loadSamplesBtn:document.getElementById('loadSamplesBtn'),
    taskList:      document.getElementById('taskList'),
    taskMessage:   document.getElementById('taskMessage'),
    totalCount:    document.getElementById('totalCount'),
    pendingCount:  document.getElementById('pendingCount'),
    completedCount:document.getElementById('completedCount')
  };

  const refreshCounts = () =>
    display.updateTaskCounts(taskList, totalCount, pendingCount, completedCount);

  const clearMessage = () => { taskMessage.textContent = ''; };
  const showMessage  = (text) => { taskMessage.textContent = text; };


  function addTask(taskText) {
    if (!utils.isValidTaskText(taskText)) {
      showMessage(data.messages.EMPTY);
      return;
    }

    const li = display.createTaskElement(
      utils.normalizeText(taskText),
      data.getNextTaskId()
    );

    taskList.append(li);
    taskInput.value = '';
    clearMessage();
    refreshCounts();
  }

  function toggleTaskComplete(taskItem) {
    taskItem.classList.toggle('completed');
    const isCompleted = taskItem.classList.contains('completed');
    taskItem.dataset.state = isCompleted ? 'completed' : 'pending';
    refreshCounts();
  }

  function beginTaskEdit(taskItem) {
    display.showEditInput(taskItem);
  }

  function saveTaskEdit(taskItem) {
    const input = taskItem.querySelector('.edit-input');
    if (!input) return;

    if (!utils.isValidTaskText(input.value)) {
      showMessage(data.messages.EMPTY);
      return;
    }

    display.commitEdit(taskItem, utils.normalizeText(input.value));
    clearMessage();
  }

  function removeTask(taskItem) {
    taskItem.remove();
    refreshCounts();
  }

  function loadSampleTasks() {
    const fragment = display.buildSampleFragment(data.sampleTasks);
    taskList.append(fragment);         
    clearMessage();
    refreshCounts();
  }


  function handleTaskListClick(event) {
    const { target } = event;
    const taskItem = target.closest('.task-item');
    if (!taskItem) return;

    if (target.classList.contains('complete-btn')) {
      toggleTaskComplete(taskItem);
    } else if (target.classList.contains('edit-btn')) {
      const isEditing = !!taskItem.querySelector('.edit-input');
      if (isEditing) saveTaskEdit(taskItem);
      else beginTaskEdit(taskItem);
    } else if (target.classList.contains('remove-btn')) {
      removeTask(taskItem);
    }
  }

  addTaskBtn.addEventListener('click', () => addTask(taskInput.value));
  loadSamplesBtn.addEventListener('click', loadSampleTasks);
  taskList.addEventListener('click', handleTaskListClick);

  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask(taskInput.value);
  });

  refreshCounts();

})();