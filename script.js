"use strict";

let taskType = `todo`;
let editElement = null;

const mainCenter = document.querySelector(`.sec`),
  footer = document.querySelector(`footer`),
  createWork = document.querySelector(`.create--btn`),
  deleteWork = document.querySelector(`.delete--work`),
  textArea = document.querySelector(`.textarea--1`),
  taskTextArea = document.querySelector(`.textarea--2`),
  editTextArea = document.querySelector(`.textarea--3`),
  workTitle = document.querySelector(`.work--title`),
  pageTitle = document.querySelector(`title`),
  lists = document.querySelector(`.list`),
  modalAddTasks = document.querySelector(`.add--task`),
  modalEditTasks = document.querySelector(`.edit--task--modal`),
  cancelBtn = document.querySelector(`.cancel`),
  overlay = document.querySelector(`.overlay`),
  addTodo = document.querySelector(`.add-todo`),
  addDoing = document.querySelector(`.add-doing`),
  addDone = document.querySelector(`.add-done`),
  addButton = document.querySelector(`.add`),
  saveButton = document.querySelector(`.save`),
  todoTasks = document.querySelector(`.todo-tasks`),
  doingTasks = document.querySelector(`.doing-tasks`),
  doneTasks = document.querySelector(`.done-tasks`),
  warning = document.querySelectorAll(`.no-text-warning`);

setupPage();

createWork.addEventListener(`click`, () => {
  const workName = textArea.value;
  createWorkspace(workName);
});

deleteWork.addEventListener(`click`, () => {
  const canDelete = confirm(`Are you sure you want to delete this workspace?`);
  if (canDelete) {
    localStorage.clear();
    hideWorkspace();
    removeOldTasks();
    showStart();
    textArea.focus();
    pageTitle.textContent = `doingto`;
  }
});

textArea.addEventListener(`keypress`, (e) => {
  if (e.key === `Enter`) {
    const workName = textArea.value;
    createWorkspace(workName);
  }
});

addTodo.addEventListener(`click`, () => {
  showModal();
  taskTextArea.focus();
  taskType = `todo`;
});

addDoing.addEventListener(`click`, () => {
  showModal();
  taskTextArea.focus();
  taskType = `doing`;
});

addDone.addEventListener(`click`, () => {
  showModal();
  taskTextArea.focus();
  taskType = `done`;
});

cancelBtn.addEventListener(`click`, () => {
  hideModal();
  hideWarning();
});

overlay.addEventListener(`click`, () => {
  hideModal();
  hideWarning();
  hideEditModal();
});

addButton.addEventListener(`click`, () => {
  addTask();
});

taskTextArea.addEventListener(`keypress`, (e) => {
  hideWarning();
  if (e.key === `Enter`) {
    addTask();
  }
});

saveButton.addEventListener(`click`, () => {
  editTask();
});

editTextArea.addEventListener(`keypress`, (e) => {
  hideWarning();
  if (e.key === `Enter`) {
    editTask();
  }
});

todoTasks.addEventListener(`click`, (e) => {
  const item = e.target;
  if (item.classList[1] === `delete-task`) {
    deleteTodo(item);
  } else if (item.classList[1] === `move-task`) {
    moveTodo(item, `doing`);
  } else if (item.classList[1] === `edit--task`) {
    prepareEdit(item);
  }
});

doingTasks.addEventListener(`click`, (e) => {
  const item = e.target;
  if (item.classList[1] === `delete-task`) {
    deleteTodo(item);
  } else if (item.classList[1] === `move-task`) {
    moveTodo(item, `done`);
  } else if (item.classList[1] === `edit--task`) {
    prepareEdit(item);
  }
});

doneTasks.addEventListener(`click`, (e) => {
  const item = e.target;
  if (item.classList[1] === `delete-task`) {
    item.parentElement.remove();
    const taskId = Number(item.parentElement.children[0].id);
    removeTaskFromStorage(taskId);
  } else if (item.classList[1] === `edit--task`) {
    prepareEdit(item);
  }
});

function setupPage() {
  const isWork = localStorage.getItem(`isWork`);
  if (isWork === `true`) {
    hideStart();
    showWorkspace();
    reloadWorkspace();

    const savedTasks = JSON.parse(localStorage.getItem(`tasks`)) || [];

    savedTasks.forEach((task) => {
      createTodo(task);
    });
  } else {
    showStart();
    hideWorkspace();
    textArea.focus();
  }
}

function addTask() {
  const input = taskTextArea.value.trim();
  taskTextArea.value = ``;
  const taskInput = makeTask(input, taskType);

  if (input === ``) {
    showWarning();
  } else {
    hideModal();
    hideWarning();
    saveTaskToStorage(taskInput);
    createTodo(taskInput);
  }
}

function hideStart() {
  mainCenter.classList.add(`hidden`);
  footer.classList.add(`hidden`);
}

function showStart() {
  mainCenter.classList.remove(`hidden`);
  footer.classList.remove(`hidden`);
}

function hideWorkspace() {
  workTitle.classList.add(`hidden`);
  lists.classList.add(`hidden`);
  hideLists();
  deleteWork.classList.add(`hidden`);
}

function showWorkspace() {
  workTitle.classList.remove(`hidden`);
  lists.classList.remove(`hidden`);
  deleteWork.classList.remove(`hidden`);
}

function createWorkspace(workName) {
  if (!workName) workName = `Today's work`;
  workTitle.textContent = workName;
  localStorage.setItem(`isWork`, `true`);
  localStorage.setItem(`workName`, workName);
  showWorkspace();
  hideStart();
  setupLists();
  updateDocumentTitle();
  textArea.value = ``;
}

function reloadWorkspace() {
  const workName = localStorage.getItem(`workName`);
  workTitle.textContent = workName;
  setupLists();
  updateDocumentTitle();
}

function updateDocumentTitle() {
  const workName = localStorage.getItem(`workName`);
  pageTitle.textContent = `${workName} | doingto`;
}

function setupLists() {
  lists.style.display = `flex`;
  lists.style.justifyContent = `space-evenly`;
  lists.style.flexWrap = `wrap`;
}

function hideLists() {
  lists.style.display = `none`;
}

function showModal() {
  overlay.classList.remove(`hidden`);
  modalAddTasks.classList.remove(`hidden`);
}

function hideModal() {
  overlay.classList.add(`hidden`);
  modalAddTasks.classList.add(`hidden`);
}
function showEditModal() {
  overlay.classList.remove(`hidden`);
  modalEditTasks.classList.remove(`hidden`);
}

function hideEditModal() {
  overlay.classList.add(`hidden`);
  modalEditTasks.classList.add(`hidden`);
}

function showWarning() {
  warning.forEach((item) => {
    item.classList.remove(`hidden`);
  });
}

function hideWarning() {
  warning.forEach((item) => {
    item.classList.add(`hidden`);
  });
}

function removeOldTasks() {
  todoTasks.innerHTML = ``;
  doingTasks.innerHTML = ``;
  doneTasks.innerHTML = ``;
}

function saveTaskToStorage(task) {
  const savedTasks = JSON.parse(localStorage.getItem(`tasks`)) || [];
  savedTasks.push(task);
  localStorage.setItem(`tasks`, JSON.stringify(savedTasks));
}

function removeTaskFromStorage(taskId) {
  const savedTasks = JSON.parse(localStorage.getItem(`tasks`));
  const newTaskList = savedTasks.filter((item) => {
    return item.id !== taskId;
  });
  localStorage.setItem(`tasks`, JSON.stringify(newTaskList));
}

function updateTitleToStorage(newTitle, taskId) {
  const savedTasks = JSON.parse(localStorage.getItem(`tasks`));
  savedTasks.forEach((item) => {
    if (item.id == taskId) {
      item.title = newTitle;
    }
  });
  localStorage.setItem(`tasks`, JSON.stringify(savedTasks));
}

function makeTask(taskTitle, toList) {
  return {
    title: taskTitle,
    list: toList,
    id: Date.now(),
  };
}

function createTodo(task) {
  const taskListElement = document.createElement(`li`);
  taskListElement.classList.add(`tasks-list-items`);

  if (task.list === `todo`) {
    taskListElement.innerHTML =
      `<p id="${task.id}">${task.title}</p> <span class="material-symbols-outlined edit--task">edit</span> <span class="material-symbols-outlined delete-task">delete</span> <span class="material-symbols-outlined move-task">forward</span>`;
    todoTasks.appendChild(taskListElement);
  } else if (task.list === `doing`) {
    taskListElement.innerHTML =
      `<p id="${task.id}">${task.title}</p> <span class="material-symbols-outlined edit--task">edit</span> <span class="material-symbols-outlined delete-task">delete</span> <span class="material-symbols-outlined move-task">forward</span>`;
    doingTasks.appendChild(taskListElement);
  } else if (task.list === `done`) {
    taskListElement.innerHTML =
      `<p id="${task.id}">${task.title}</p> <span class="material-symbols-outlined edit--task">edit</span> <span class="material-symbols-outlined delete-task">delete</span> <span class="material-symbols-outlined done-task">task_alt</span>`;
    doneTasks.appendChild(taskListElement);
  }
}

function deleteTodo(element) {
  element.parentElement.remove();
  const taskId = Number(element.parentElement.children[0].id);
  removeTaskFromStorage(taskId);
}

function moveTodo(element, list) {
  deleteTodo(element);
  const newTask = makeTask(
    element.parentElement.children[0].textContent,
    list,
  );
  saveTaskToStorage(newTask);
  createTodo(newTask);
}

function prepareEdit(element) {
  editElement = element.parentElement.children[0];
  showEditModal();
  editTextArea.value = editElement.textContent;

  /* Move cursor to end to text */
  const end = editTextArea.value.length;
  editTextArea.setSelectionRange(end, end);
  editTextArea.focus();
  /* --- */
}

function editTask() {
  const newTaskContent = editTextArea.value.trim();
  if (newTaskContent === ``) {
    showWarning();
  } else {
    editElement.textContent = newTaskContent;
    hideEditModal();
    updateTitleToStorage(newTaskContent, Number(editElement.id));
  }
}
