// ============================================
// HORIZON CAFÉ - CHAT PAGE JS
// SYSTÈME DE CHAT EN TEMPS RÉEL AVEC POLLING
// ============================================

// API_URL est défini dans config.js (détecte automatiquement l'environnement)
const API_URL_CHAT = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:5000/api';
let chats = {};
let selectedChat = null;
let pollingInterval = null;
let currentUser = null;
let lastMessageTimestamp = {};

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', async () => {
  // Récupérer l'utilisateur actuel
  currentUser = JSON.parse(localStorage.getItem('user'));
  if (!currentUser) {
    window.location.href = '/login.html';
    return;
  }
  
  // Mettre à jour le greeting avec le vrai username
  const userGreeting = document.getElementById('userGreeting');
  if (userGreeting) {
    userGreeting.textContent = currentUser.username || 'Utilisateur';
  }

  // Charger les chats sauvegardés (localStorage)
  loadChats();
  
  // Charger les conversations depuis le serveur
  await loadConversationsFromServer();
  
  // Charger les utilisateurs disponibles
  await loadAvailableUsers();
  
  // Initialiser l'interface
  renderChatLists();
  
  // Event listeners
  document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Arrêter polling ancien s'il existe
  if (pollingInterval) clearInterval(pollingInterval);
  
  // Lancer le polling auto toutes les 2 secondes
  startPolling();
});

// Polling auto pour les messages
function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  
  pollingInterval = setInterval(async () => {
    if (!selectedChat) return;
    
    try {
      const response = await fetch(`${API_URL_CHAT}/messages/chat/${selectedChat}`);
      if (!response.ok) return;
      
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        const newMessages = data.messages.filter(msg => 
          !chats[selectedChat]?.messages?.some(m => m.id === msg.id)
        );
        
        if (newMessages.length > 0) {
          // Si la conversation n'existe pas encore, la créer
          if (!chats[selectedChat]) {
            const senderName = newMessages[0].senderUsername || 'Conversation';
            chats[selectedChat] = {
              type: selectedChat.startsWith('dm_') ? 'direct' : 'group',
              name: senderName,
              members: [],
              messages: []
            };
          }
          
          if (!chats[selectedChat].messages) {
            chats[selectedChat].messages = [];
          }
          chats[selectedChat].messages.push(...newMessages);
          renderMessages();
          saveChats();
        }
      }
    } catch (error) {
      // Silencieux - c'est normal si le serveur est occupé
    }
  }, 2000);
}

// ===== GESTION DES CHATS =====
function loadChats() {
  const saved = localStorage.getItem('chats');
  chats = saved ? JSON.parse(saved) : {};
  
  // Initialiser lastMessageTimestamp
  Object.keys(chats).forEach(chatId => {
    lastMessageTimestamp[chatId] = 0;
  });
}

function saveChats() {
  localStorage.setItem('chats', JSON.stringify(chats));
}

async function loadConversationsFromServer() {
  try {
    let token = localStorage.getItem('token');
    if (!token) {
      const authData = localStorage.getItem('authData');
      if (authData) {
        const parsed = JSON.parse(authData);
        token = parsed.token;
      }
    }

    if (!token) {
      console.log('⚠️ Pas de token pour charger les conversations du serveur');
      return;
    }

    console.log('📥 Chargement des conversations depuis le serveur...');
    const response = await fetch(`${API_URL}/messages/conversations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.warn('⚠️ Erreur fetch conversations:', response.status);
      return;
    }

    const data = await response.json();
    console.log('✓ Conversations chargées:', Object.keys(data.conversations).length);

    // Fusionner avec localStorage
    chats = { ...data.conversations, ...chats };

    // Assurer que le groupe General existe
    if (!chats['grp_general']) {
      chats['grp_general'] = {
        id: 'grp_general',
        name: 'General',
        type: 'group',
        messages: [],
        lastMessage: null,
        lastMessageTime: null
      };
      console.log('✓ Groupe General créé localement');
    }

    saveChats();

  } catch (err) {
    console.error('❌ Erreur chargement conversations:', err);
  }
}

function renderChatLists() {
  const directContainer = document.getElementById('direct');
  const groupsContainer = document.getElementById('groups');
  
  directContainer.innerHTML = '';
  groupsContainer.innerHTML = '';

  // Trier les chats par dernier message
  const sortedChats = Object.entries(chats).sort((a, b) => {
    const timeA = a[1].messages?.length > 0 
      ? new Date(a[1].messages[a[1].messages.length - 1].timestamp).getTime() 
      : 0;
    const timeB = b[1].messages?.length > 0 
      ? new Date(b[1].messages[b[1].messages.length - 1].timestamp).getTime() 
      : 0;
    return timeB - timeA;
  });

  sortedChats.forEach(([chatId, chat]) => {
    const lastMessage = chat.messages?.length > 0 
      ? chat.messages[chat.messages.length - 1].text 
      : 'Aucun message';
    
    const preview = lastMessage.substring(0, 50) + (lastMessage.length > 50 ? '...' : '');
    
    const chatEl = document.createElement('div');
    chatEl.className = 'chat-item';
    chatEl.innerHTML = `
      <div class="avatar${chat.type === 'group' ? ' group' : ''}">
        ${chat.type === 'group' ? '<i class="fas fa-users"></i>' : chat.name.charAt(0).toUpperCase()}
      </div>
      <div class="chat-info">
        <h4>${chat.name}</h4>
        <p>${preview}</p>
      </div>
      <div style="margin-left:auto; cursor:pointer;" onclick="event.stopPropagation(); showChatMenu('${chatId}', event)" title="Menu">
        <i class="fas fa-ellipsis-v" style="color:#888;"></i>
      </div>
    `;
    
    chatEl.addEventListener('click', () => {
      selectChat(chatId, chatEl);
    });
    
    if (chat.type === 'group') {
      groupsContainer.appendChild(chatEl);
    } else {
      directContainer.appendChild(chatEl);
    }
  });
}

function selectChat(chatId, element) {
  selectedChat = chatId;
  
  // Mettre à jour styles
  document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
  if (element) element.classList.add('active');
  
  // Afficher les messages
  renderMessages();
  
  // Focus input
  document.getElementById('chatInput').focus();
}

function renderMessages() {
  const chatWindow = document.getElementById('chatWindow');
  const chat = chats[selectedChat];
  
  if (!chat || !currentUser) {
    chatWindow.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">Conversation vide</div>';
    return;
  }

  chatWindow.innerHTML = '';
  
  // Afficher chaque message
  chat.messages?.forEach(msg => {
    const messageEl = document.createElement('div');
    const isSender = String(msg.senderId) === String(currentUser.id);
    messageEl.className = `message ${isSender ? 'user' : 'bot'}`;
    const timestamp = new Date(msg.timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    messageEl.innerHTML = `
      <div style="font-weight:600; font-size:0.8rem; color:#00d2ff; margin-bottom:0.25rem;">
        ${msg.senderUsername || (isSender ? 'Vous' : 'Utilisateur')}
      </div>
      <div>${msg.text}</div>
      <div style="font-size:0.75rem; margin-top:0.5rem; opacity:0.7;">${timestamp}</div>
    `;
    
    chatWindow.appendChild(messageEl);
  });
  
  // Auto scroll
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ===== ENVOI DE MESSAGE =====
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  
  if (!text || !selectedChat) return;
  
  try {
    // Récupérer le token (depuis authData ou token)
    let token = localStorage.getItem('token');
    if (!token) {
      const authData = localStorage.getItem('authData');
      if (authData) {
        const parsed = JSON.parse(authData);
        token = parsed.token;
      }
    }
    
    console.log('🔐 Token:', token ? token.substring(0, 20) + '...' : 'MANQUANT');
    console.log('💬 Chat ID:', selectedChat);
    console.log('📝 Message:', text);
    
    if (!token) {
      console.error('❌ Token manquant! Redirection vers login...');
      alert('Session expirée. Veuillez vous reconnecter.');
      window.location.href = '/login.html';
      return;
    }
    
    // Envoyer au serveur
    const response = await fetch(`${API_URL_CHAT}/messages/chat/${selectedChat}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errData = await response.json();
      console.error('❌ Erreur serveur:', response.status, errData);
      throw new Error(errData.error || 'Erreur envoi message');
    }
    
    const data = await response.json();
    console.log('✅ Réponse serveur:', data);
    
    // Ajouter le message localement
    if (!chats[selectedChat].messages) {
      chats[selectedChat].messages = [];
    }
    
    chats[selectedChat].messages.push({
      id: data.message.id,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      text: text,
      timestamp: new Date(),
      type: 'user'
    });
    
    saveChats();
    renderMessages();
    input.value = '';
    
    console.log('✅ Message envoyé et affiché');
  } catch (err) {
    console.error('❌ Erreur envoi:', err);
    alert('Erreur lors de l\'envoi du message: ' + err.message);
  }
}

// ===== POLLING TEMPS RÉEL =====
function startPollingChat(chatId) {
  // Arrêter polling précédent
  if (pollingInterval) clearInterval(pollingInterval);
  
  // Faire un polling immédiat
  fetchNewMessages(chatId);
  
  // Puis polling toutes les 2 secondes
  pollingInterval = setInterval(() => {
    if (selectedChat === chatId) {
      fetchNewMessages(chatId);
    }
  }, 2000);
}

async function fetchNewMessages(chatId) {
  try {
    const response = await fetch(`${API_URL}/messages/chat/${chatId}`);
    if (!response.ok) throw new Error('Erreur fetch messages');
    
    const data = await response.json();
    const newMessages = data.messages || [];
    
    // Ajouter les nouveaux messages
    if (!chats[chatId].messages) {
      chats[chatId].messages = [];
    }
    
    newMessages.forEach(msg => {
      // Vérifier si le message existe déjà
      const exists = chats[chatId].messages.some(m => m.id === msg.id);
      if (!exists) {
        chats[chatId].messages.push({
          id: msg.id,
          senderId: msg.senderId,
          senderUsername: msg.senderUsername,
          text: msg.text,
          timestamp: new Date(msg.timestamp),
          type: 'user'
        });
      }
    });
    
    saveChats();
    
    // Rafraîchir l'affichage si c'est le chat sélectionné
    if (selectedChat === chatId) {
      renderMessages();
    }
    
  } catch (err) {
    console.error('Erreur polling:', err);
  }
}

// ===== CRÉATION DE CONVERSATIONS =====
let availableUsers = [];

async function loadAvailableUsers() {
  try {
    const response = await fetch(`${API_URL_CHAT}/auth/users/public`);
    if (!response.ok) throw new Error('Erreur fetch users');
    
    const data = await response.json();
    
    // Gérer différents formats de réponse
    if (Array.isArray(data)) {
      availableUsers = data;
    } else if (data.users && Array.isArray(data.users)) {
      availableUsers = data.users;
    } else if (data.data && Array.isArray(data.data)) {
      availableUsers = data.data;
    } else if (data.result && Array.isArray(data.result)) {
      availableUsers = data.result;
    } else {
      console.warn('Format utilisateurs inconnu:', data);
      availableUsers = [];
    }
    
    // Filtrer l'utilisateur actuel
    availableUsers = availableUsers.filter(u => String(u.id) !== String(currentUser.id));
    
    console.log('✅ Utilisateurs chargés:', availableUsers.length);
  } catch (err) {
    console.error('❌ Erreur chargement utilisateurs:', err);
    availableUsers = [
      { id: 'user-2', username: 'Test User 1' },
      { id: 'user-3', username: 'Test User 2' }
    ];
  }
}

function createNewChat() {
  const modal = document.getElementById('createChatModal');
  modal.classList.add('active');
  
  // Réinitialiser le modal
  switchModalTab('direct');
  document.getElementById('searchDirect').value = '';
  
  // Les éléments du groupe sont masqués, ne pas y accéder
  // document.getElementById('searchGroup').value = '';
  // document.getElementById('groupName').value = '';
  
  document.querySelectorAll('input[name="directUser"]').forEach(el => el.checked = false);
  // document.querySelectorAll('input[name="groupUsers"]').forEach(el => el.checked = false);
  
  renderUserLists();
}

function switchModalTab(type) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.modal-section').forEach(s => s.classList.remove('active'));
  
  event?.currentTarget.classList.add('active');
  if (type === 'direct') {
    document.querySelector('[data-tab="direct"]').classList.add('active');
    document.getElementById('directSection').classList.add('active');
  } else {
    document.querySelector('[data-tab="group"]').classList.add('active');
    document.getElementById('groupSection').classList.add('active');
  }
}

function renderUserLists() {
  const directList = document.getElementById('directUserList');
  
  // Le groupList n'existe plus puisqu'on a masqué l'onglet groupes
  // const groupList = document.getElementById('groupUserList');
  
  if (!directList) {
    console.error('❌ directUserList not found!');
    return;
  }
  
  directList.innerHTML = '';
  
  // Ne pas essayer de rendre groupList qui n'existe plus
  // if (groupList) groupList.innerHTML = '';
  
  if (!availableUsers || availableUsers.length === 0) {
    console.warn('⚠️ Pas d\'utilisateurs disponibles');
    directList.innerHTML = '<p>Aucun utilisateur disponible</p>';
    return;
  }
  
  availableUsers.forEach(user => {
    // Pour messages directs
    const directEl = document.createElement('div');
    directEl.className = 'user-item';
    directEl.innerHTML = `
      <input type="radio" name="directUser" value="${user.id}" id="user-${user.id}">
      <label for="user-${user.id}">${user.username}</label>
    `;
    directList.appendChild(directEl);
  });
  
  console.log('✓ Liste utilisateurs rendue:', availableUsers.length);
}

function filterUsers(type) {
  if (type !== 'direct') return; // On a supprimé les groupes
  
  const searchTerm = document.getElementById('searchDirect').value.toLowerCase();
  const userItems = document.querySelectorAll('#directUserList .user-item');
  
  userItems.forEach(item => {
    const label = item.querySelector('label').textContent.toLowerCase();
    item.style.display = label.includes(searchTerm) ? 'flex' : 'none';
  });
}

function confirmCreateChat() {
  // Message direct - c'est le seul type disponible maintenant
  const selected = document.querySelector('input[name="directUser"]:checked');
  if (!selected) {
    alert('Sélectionnez un utilisateur');
    return;
  }
  
  const userId = selected.value;
  const user = availableUsers.find(u => String(u.id) === String(userId));
  
  if (!user) {
    alert('Utilisateur non trouvé');
    return;
  }
  
  const chatId = `dm_${userId}`;
  
  if (!chats[chatId]) {
    chats[chatId] = {
      type: 'direct',
      name: user.username,
      members: [currentUser.id, userId],
      messages: []
    };
    saveChats();
    renderChatLists();
  }
  
  closeModal();
  selectChat(chatId, document.querySelector(`[data-chatid="${chatId}"]`));
}

function closeModal() {
  const modal = document.getElementById('createChatModal');
  modal.classList.remove('active');
}

// ===== THEME TOGGLE =====
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'dark-mode';
  
  if (savedTheme === 'light-mode') {
    document.body.classList.add('light-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  
  themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light-mode' : 'dark-mode');
    themeToggle.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });
});

// ===== NAVIGATION =====
function switchChatType(type, event) {
  if (event) {
    event.preventDefault();
    event.target.blur();
  }
  
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  
  const directList = document.getElementById('direct');
  const groupsList = document.getElementById('groups');
  
  if (type === 'direct') {
    tabs[0].classList.add('active');
    directList.style.display = 'flex';
    directList.style.flexDirection = 'column';
    groupsList.style.display = 'none';
  } else if (type === 'groups') {
    tabs[1].classList.add('active');
    directList.style.display = 'none';
    groupsList.style.display = 'flex';
    groupsList.style.flexDirection = 'column';
  }
}

function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('active');
}

function goToProfile() {
  window.location.href = '/admin.html';
}

function logout() {
  if (pollingInterval) clearInterval(pollingInterval);
  localStorage.removeItem('token');
  localStorage.removeItem('authData');
  localStorage.removeItem('user');
  localStorage.removeItem('chats');
  window.location.href = '/login.html';
}

function clearAllConversations() {
  if (confirm('⚠️ Êtes-vous sûr? Cela va supprimer toutes les conversations locales.')) {
    chats = {};
    saveChats();
    selectedChat = null;
    renderChatLists();
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) chatWindow.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">Aucune conversation</div>';
  }
}

function showChatMenu(chatId, event) {
  const existingMenu = document.getElementById('chatMenu');
  if (existingMenu) existingMenu.remove();
  
  const menu = document.createElement('div');
  menu.id = 'chatMenu';
  menu.style.cssText = `
    position: fixed;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 6px;
    padding: 0.5rem 0;
    z-index: 3000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.5);
    min-width: 200px;
  `;
  menu.style.top = (event.pageY) + 'px';
  menu.style.left = (event.pageX) + 'px';
  
  menu.innerHTML = `
    <div style="padding:0.5rem 1rem; cursor:pointer; color:#e0e0e0; border-bottom:1px solid #2a2a2a;" 
         onmouseover="this.style.background='rgba(0,210,255,0.2)'" 
         onmouseout="this.style.background='transparent'"
         onclick="deleteConversation('${chatId}')">
      <i class="fas fa-trash"></i> Supprimer définitivement
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Fermer le menu en cliquant ailleurs
  document.addEventListener('click', function closeMenu(e) {
    if (menu && !menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  });
}

async function deleteConversation(chatId) {
  if (!confirm('⚠️ Cette conversation sera supprimée définitivement de la base de données.')) {
    const menu = document.getElementById('chatMenu');
    if (menu) menu.remove();
    return;
  }
  
  try {
    let token = localStorage.getItem('token');
    if (!token) {
      const authData = localStorage.getItem('authData');
      if (authData) {
        const parsed = JSON.parse(authData);
        token = parsed.token;
      }
    }
    
    // Appeler l'API pour supprimer la conversation
    const response = await fetch(`${API_URL_CHAT}/messages/chat/${chatId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      // Supprimer du localStorage
      delete chats[chatId];
      saveChats();
      
      if (selectedChat === chatId) {
        selectedChat = null;
        const chatWindow = document.getElementById('chatWindow');
        if (chatWindow) chatWindow.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">Aucune conversation</div>';
      }
      
      renderChatLists();
      console.log('✓ Conversation supprimée');
    } else {
      console.error('❌ Erreur suppression:', response.status);
      alert('Erreur lors de la suppression');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    alert('Erreur lors de la suppression: ' + error.message);
  }
  
  const menu = document.getElementById('chatMenu');
  if (menu) menu.remove();
}

