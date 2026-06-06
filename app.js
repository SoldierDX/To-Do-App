// Lógica do aplicativo de tarefas (TaskFlow)
// Feito com Vanilla JS e persistência local

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o banco de dados local simulado
  initStorage();

  // Mapeamento dos elementos do DOM
  const views = {
    login: document.getElementById('loginView'),
    register: document.getElementById('registerView'),
    dashboard: document.getElementById('dashboardView')
  };

  const forms = {
    login: document.getElementById('loginForm'),
    register: document.getElementById('registerForm'),
    todo: document.getElementById('todoForm')
  };

  const inputs = {
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    registerName: document.getElementById('registerName'),
    registerEmail: document.getElementById('registerEmail'),
    registerPassword: document.getElementById('registerPassword'),
    todoTitle: document.getElementById('todoTitle'),
    todoType: document.getElementById('todoType'),
    todoDescription: document.getElementById('todoDescription')
  };

  const errorContainers = {
    loginGeneral: document.getElementById('loginGeneralError'),
    loginEmail: document.getElementById('loginEmailError'),
    loginPassword: document.getElementById('loginPasswordError'),
    registerGeneral: document.getElementById('registerGeneralError'),
    registerName: document.getElementById('registerNameError'),
    registerEmail: document.getElementById('registerEmailError'),
    registerPassword: document.getElementById('registerPasswordError'),
    todoTitle: document.getElementById('todoTitleError')
  };

  // Botões e links de navegação
  const toRegisterBtn = document.getElementById('toRegisterBtn');
  const toLoginBtn = document.getElementById('toLoginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const welcomeUserName = document.getElementById('welcomeUserName');

  // Listagem de tarefas
  const todosContainer = document.getElementById('todosContainer');

  // Elementos das estatísticas
  const stats = {
    total: document.getElementById('statTotal'),
    done: document.getElementById('statDone'),
    overdue: document.getElementById('statOverdue') // Agora serve para as pendentes de forma geral
  };

  // --- CONTROLE DE VIEWS ---

  function showView(viewName) {
    // Esconde todas as telas
    Object.keys(views).forEach(key => {
      views[key].classList.add('hidden');
    });

    // Mostra a tela selecionada
    views[viewName].classList.remove('hidden');

    // Limpa mensagens de erro ao alternar de tela
    clearAllErrors();
  }

  // Navegação rápida
  toRegisterBtn.addEventListener('click', () => showView('register'));
  toLoginBtn.addEventListener('click', () => showView('login'));

  // --- PERSISTÊNCIA LOCAL ---

  function initStorage() {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('todos')) {
      localStorage.setItem('todos', JSON.stringify([]));
    }
  }

  function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
  }

  function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }

  function getTodos() {
    return JSON.parse(localStorage.getItem('todos')) || [];
  }

  function saveTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
  }

  function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  function removeCurrentUser() {
    localStorage.removeItem('currentUser');
  }

  // --- TRATAMENTO E VALIDAÇÃO DE ERROS ---

  function showError(container, inputElement, message) {
    container.textContent = message;
    container.classList.remove('hidden');
    if (inputElement) {
      inputElement.classList.add('border-rose-500', 'focus:ring-rose-500/10');
      inputElement.classList.remove('border-slate-800', 'focus:border-brand');
    }
  }

  function clearError(container, inputElement) {
    container.textContent = '';
    container.classList.add('hidden');
    if (inputElement) {
      inputElement.classList.remove('border-rose-500', 'focus:ring-rose-500/10');
      inputElement.classList.add('border-slate-800', 'focus:border-brand');
    }
  }

  function clearAllErrors() {
    Object.values(errorContainers).forEach(container => {
      container.textContent = '';
      container.classList.add('hidden');
    });

    Object.values(inputs).forEach(input => {
      input.classList.remove('border-rose-500', 'focus:ring-rose-500/10');
      input.classList.add('border-slate-800', 'focus:border-brand');
      input.value = ''; // Limpa os campos
    });
  }

  // Limpa os erros de forma reativa conforme o usuário digita nos inputs
  Object.keys(inputs).forEach(key => {
    inputs[key].addEventListener('input', () => {
      if (errorContainers[key + 'Error']) {
        clearError(errorContainers[key + 'Error'], inputs[key]);
      } else if (errorContainers[key]) {
        clearError(errorContainers[key], inputs[key]);
      }
      clearError(errorContainers.loginGeneral);
      clearError(errorContainers.registerGeneral);
    });
  });

  // --- FLUXO DE AUTENTICAÇÃO ---

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Cadastro de Usuário
  forms.register.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = inputs.registerName.value.trim();
    const email = inputs.registerEmail.value.trim();
    const password = inputs.registerPassword.value;
    let hasError = false;

    if (!name) {
      showError(errorContainers.registerName, inputs.registerName, 'O nome completo é obrigatório');
      hasError = true;
    }

    if (!email) {
      showError(errorContainers.registerEmail, inputs.registerEmail, 'O e-mail é obrigatório');
      hasError = true;
    } else if (!isValidEmail(email)) {
      showError(errorContainers.registerEmail, inputs.registerEmail, 'Por favor, insira um e-mail válido');
      hasError = true;
    }

    if (!password) {
      showError(errorContainers.registerPassword, inputs.registerPassword, 'A senha é obrigatória');
      hasError = true;
    } else if (password.length < 6) {
      showError(errorContainers.registerPassword, inputs.registerPassword, 'A senha deve ter pelo menos 6 caracteres');
      hasError = true;
    }

    if (hasError) return;

    const users = getUsers();
    const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
      showError(errorContainers.registerGeneral, null, 'Este e-mail já está cadastrado.');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password
    };

    saveUser(newUser);

    showView('login');
    showError(errorContainers.loginGeneral, null, 'Conta criada com sucesso! Faça seu login.');
    errorContainers.loginGeneral.classList.remove('bg-rose-500/10', 'border-rose-500/20', 'text-rose-400');
    errorContainers.loginGeneral.classList.add('bg-emerald-500/10', 'border-emerald-500/20', 'text-emerald-400');
  });

  // Login do Usuário
  forms.login.addEventListener('submit', (e) => {
    e.preventDefault();

    errorContainers.loginGeneral.classList.add('bg-rose-500/10', 'border-rose-500/20', 'text-rose-400');
    errorContainers.loginGeneral.classList.remove('bg-emerald-500/10', 'border-emerald-500/20', 'text-emerald-400');

    const email = inputs.loginEmail.value.trim();
    const password = inputs.loginPassword.value;
    let hasError = false;

    if (!email) {
      showError(errorContainers.loginEmail, inputs.loginEmail, 'O e-mail é obrigatório');
      hasError = true;
    }

    if (!password) {
      showError(errorContainers.loginPassword, inputs.loginPassword, 'A senha é obrigatória');
      hasError = true;
    }

    if (hasError) return;

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      showError(errorContainers.loginGeneral, null, 'E-mail não cadastrado ou credenciais inválidas.');
      return;
    }

    if (user.password !== password) {
      showError(errorContainers.loginGeneral, null, 'Senha incorreta. Verifique suas credenciais.');
      return;
    }

    setCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email
    });

    loadDashboard();
  });

  // Logout do Usuário
  logoutBtn.addEventListener('click', () => {
    removeCurrentUser();
    showView('login');
  });

  // --- GERENCIAMENTO DE TAREFAS (TO-DOS) ---

  // Envio do formulário de criação de tarefas
  forms.todo.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const title = inputs.todoTitle.value.trim();
    const type = inputs.todoType.value;
    const description = inputs.todoDescription.value.trim();

    if (!title) {
      showError(errorContainers.todoTitle, inputs.todoTitle, 'O título da tarefa é obrigatório');
      return;
    }

    const newTodo = {
      id: Date.now().toString(),
      userId: currentUser.email, // Salva associado ao e-mail do usuário logado
      title,
      type,
      description,
      done: false
    };

    const todos = getTodos();
    todos.push(newTodo);
    saveTodos(todos);

    // Reseta campos do formulário e recarrega views
    inputs.todoTitle.value = '';
    inputs.todoDescription.value = '';
    clearError(errorContainers.todoTitle, inputs.todoTitle);

    updateDashboardStats(currentUser.email);
    renderTodos(currentUser.email);
  });

  // Renderização dinâmica da lista de tarefas
  function renderTodos(userEmail) {
    todosContainer.innerHTML = '';
    const todos = getTodos();
    
    // Filtra tarefas do usuário ativo
    const userTodos = todos.filter(todo => todo.userId.toLowerCase() === userEmail.toLowerCase());

    if (userTodos.length === 0) {
      todosContainer.innerHTML = '<p class="text-center text-slate-500 py-8">Nenhuma tarefa cadastrada ainda.</p>';
      return;
    }

    // Ordena: não concluídas (done: false) primeiro, concluídas (done: true) depois
    userTodos.sort((a, b) => a.done - b.done);

    userTodos.forEach(todo => {
      const card = document.createElement('div');
      
      // Estilos do card baseados no status done
      const doneClass = todo.done 
        ? 'opacity-60 bg-slate-900/20 border-slate-900/50 shadow-none' 
        : 'bg-slate-900/40 border-slate-800/80 shadow-lg hover:border-slate-700/60';

      card.className = `border rounded-xl p-5 transition-all duration-200 ${doneClass}`;

      // Configuração de cores para os badges por tipo de tarefa (Pessoal = roxo autorizado ✅)
      let badgeColor = '';
      if (todo.type === 'Trabalho') {
        badgeColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
      } else if (todo.type === 'Pessoal') {
        badgeColor = 'bg-purple-500/10 text-purple-400 border border-purple-500/25';
      } else if (todo.type === 'Estudos') {
        badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      }

      const titleClass = todo.done ? 'line-through text-slate-500' : 'text-white font-semibold';
      const descClass = todo.done ? 'text-slate-600' : 'text-slate-350';

      // Criação interna do template do card
      card.innerHTML = `
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-2 flex-grow min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeColor}">
                ${todo.type}
              </span>
            </div>
            <h4 class="text-base break-words ${titleClass}">${todo.title}</h4>
            ${todo.description ? `<p class="text-sm break-words ${descClass} whitespace-pre-wrap">${todo.description}</p>` : ''}
          </div>
          
          <div class="flex-shrink-0">
            ${todo.done 
              ? `
                <div class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Concluído
                </div>
                `
              : `
                <button data-id="${todo.id}" class="btn-complete inline-flex items-center justify-center bg-slate-950/40 hover:bg-emerald-600 border border-slate-800 hover:border-emerald-600 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 outline-none">
                  Concluir
                </button>
                `
            }
          </div>
        </div>
      `;

      // Evento para conclusão de tarefa
      const completeBtn = card.querySelector('.btn-complete');
      if (completeBtn) {
        completeBtn.addEventListener('click', () => {
          completeTodo(todo.id);
        });
      }

      todosContainer.appendChild(card);
    });
  }

  function completeTodo(todoId) {
    const todos = getTodos();
    const todoIndex = todos.findIndex(t => t.id === todoId);
    
    if (todoIndex !== -1) {
      todos[todoIndex].done = true;
      saveTodos(todos);

      const currentUser = getCurrentUser();
      if (currentUser) {
        updateDashboardStats(currentUser.email);
        renderTodos(currentUser.email);
      }
    }
  }

  // --- GERENCIAMENTO DO DASHBOARD ---

  function loadDashboard() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showView('login');
      return;
    }

    welcomeUserName.textContent = currentUser.name;
    updateDashboardStats(currentUser.email);
    renderTodos(currentUser.email);
    showView('dashboard');
  }

  function updateDashboardStats(userEmail) {
    const todos = getTodos();
    const userTodos = todos.filter(todo => todo.userId.toLowerCase() === userEmail.toLowerCase());
    
    const total = userTodos.length;
    const done = userTodos.filter(todo => todo.done).length;
    const pending = total - done;

    // Atualiza os contadores no HTML
    stats.total.textContent = total;
    stats.done.textContent = done;
    stats.overdue.textContent = pending; // Agora representa as tarefas pendentes
  }

  // --- INICIALIZAÇÃO DO APP ---

  function checkSession() {
    const currentUser = getCurrentUser();
    if (currentUser) {
      loadDashboard();
    } else {
      showView('login');
    }
  }

  // Roda a verificação de sessão inicial
  checkSession();
});
