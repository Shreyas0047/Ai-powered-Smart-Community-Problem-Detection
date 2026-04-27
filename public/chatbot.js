(function () {
  const launcher = document.getElementById("chatbotLauncher");
  const panel = document.getElementById("chatbotPanel");
  const header = document.getElementById("chatbotHeader");
  const clearBtn = document.getElementById("chatbotClearBtn");
  const messagesRoot = document.getElementById("chatbotMessages");
  const typingRoot = document.getElementById("chatbotTyping");
  const form = document.getElementById("chatbotForm");
  const input = document.getElementById("chatbotInput");
  const sendBtn = document.getElementById("chatbotSendBtn");
  const useTranscriptBtn = document.getElementById("chatbotUseTranscriptBtn");
  const statusText = document.getElementById("chatbotStatusText");

  if (!launcher || !panel || !form || !input) {
    return;
  }

  const position = {
    x: window.innerWidth - 104,
    y: window.innerHeight - 108
  };
  const animationDurationMs = 220;

  let isOpen = false;
  let isAnimating = false;
  let dragState = null;
  let historyLoadedForUser = "";

  function getApp() {
    return window.smartCommunityApp || null;
  }

  function getAuthState() {
    return getApp()?.getAuthState?.() || null;
  }

  function getTranscript() {
    return getApp()?.getCurrentVoiceTranscript?.() || "";
  }

  function setDashboardMessage(message, type) {
    getApp()?.setDashboardMessage?.(message, type);
  }

  function clampPosition() {
    position.x = Math.max(16, Math.min(position.x, window.innerWidth - 84));
    position.y = Math.max(16, Math.min(position.y, window.innerHeight - 84));
  }

  function updateLauncherPosition() {
    clampPosition();
    launcher.style.left = `${position.x}px`;
    launcher.style.top = `${position.y}px`;
    updatePanelPosition();
  }

  function updatePanelPosition() {
    const panelWidth = 360;
    const panelHeight = 520;
    const left = Math.max(16, Math.min(position.x - panelWidth + 64, window.innerWidth - panelWidth - 16));
    const top = Math.max(16, Math.min(position.y - panelHeight - 18, window.innerHeight - panelHeight - 16));
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  function renderMessage(message) {
    const bubble = document.createElement("article");
    bubble.className = `chatbot-bubble ${message.sender === "user" ? "is-user" : "is-bot"}`;
    bubble.textContent = message.content;
    messagesRoot.appendChild(bubble);
    messagesRoot.scrollTop = messagesRoot.scrollHeight;
  }

  function renderMessages(messages) {
    messagesRoot.innerHTML = "";
    if (!messages.length) {
      renderMessage({
        sender: "bot",
        content: "Ask about complaint status, raise a complaint, get FAQs, or ask where something is in the dashboard."
      });
      return;
    }

    messages.forEach(renderMessage);
  }

  function setTyping(isTyping) {
    typingRoot.hidden = !isTyping;
  }

  function setLoading(isLoading) {
    sendBtn.disabled = isLoading;
    input.disabled = isLoading;
    setTyping(isLoading);
  }

  function updateTranscriptButton() {
    useTranscriptBtn.disabled = !getTranscript();
  }

  async function loadHistory() {
    const auth = getAuthState();

    if (!auth?.token || !auth?.userId) {
      launcher.hidden = true;
      panel.classList.remove("is-open");
      panel.hidden = true;
      isOpen = false;
      historyLoadedForUser = "";
      return;
    }

    launcher.hidden = false;
    updateTranscriptButton();

    if (historyLoadedForUser === auth.userId) {
      return;
    }

    try {
      const data = await getApp().apiRequest(`/api/chatbot/history?userId=${encodeURIComponent(auth.userId)}`, {
        method: "GET"
      });
      renderMessages(data.messages || []);
      historyLoadedForUser = auth.userId;
    } catch (error) {
      renderMessages([]);
      statusText.textContent = error.message;
    }
  }

  async function postMessage(message) {
    const auth = getAuthState();
    if (!auth?.token || !auth?.userId) {
      throw new Error("Login is required before using the assistant.");
    }

    return getApp().apiRequest("/api/chatbot/message", {
      method: "POST",
      body: JSON.stringify({
        userId: auth.userId,
        message,
        voiceTranscript: getTranscript()
      })
    });
  }

  async function clearHistory() {
    const auth = getAuthState();
    if (!auth?.token || !auth?.userId) {
      throw new Error("Login is required before clearing chat history.");
    }

    return getApp().apiRequest("/api/chatbot/history", {
      method: "DELETE",
      body: JSON.stringify({
        userId: auth.userId
      })
    });
  }

  function openPanel() {
    if (isAnimating || isOpen) {
      return;
    }

    isAnimating = true;
    isOpen = true;
    panel.hidden = false;
    updatePanelPosition();
    updateTranscriptButton();

    requestAnimationFrame(() => {
      panel.classList.add("is-open");
      window.setTimeout(() => {
        isAnimating = false;
        input.focus();
      }, animationDurationMs);
    });
  }

  function closePanel() {
    if (isAnimating || !isOpen) {
      return;
    }

    isAnimating = true;
    isOpen = false;
    panel.classList.remove("is-open");
    window.setTimeout(() => {
      panel.hidden = true;
      isAnimating = false;
    }, animationDurationMs);
  }

  launcher.addEventListener("click", async (event) => {
    if (dragState?.moved) {
      event.preventDefault();
      return;
    }

    if (isOpen) {
      closePanel();
      return;
    }

    await loadHistory();
    openPanel();
  });

  clearBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      clearBtn.disabled = true;
      const result = await clearHistory();
      renderMessages(result.messages || []);
      statusText.textContent = "Chat history cleared.";
      setDashboardMessage("Chat history cleared.", "success");
    } catch (error) {
      statusText.textContent = error.message || "Could not clear chat history.";
    } finally {
      clearBtn.disabled = false;
    }
  });

  launcher.addEventListener("pointerdown", (event) => {
    dragState = {
      pointerId: event.pointerId,
      offsetX: event.clientX - position.x,
      offsetY: event.clientY - position.y,
      moved: false
    };
    launcher.setPointerCapture(event.pointerId);
  });

  launcher.addEventListener("pointermove", (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    position.x = event.clientX - dragState.offsetX;
    position.y = event.clientY - dragState.offsetY;
    dragState.moved = true;
    updateLauncherPosition();
  });

  function clearDrag(event) {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }
    launcher.releasePointerCapture(event.pointerId);
    dragState = null;
  }

  launcher.addEventListener("pointerup", clearDrag);
  launcher.addEventListener("pointercancel", clearDrag);
  window.addEventListener("resize", updateLauncherPosition);
  header.addEventListener("pointerdown", (event) => event.stopPropagation());

  useTranscriptBtn.addEventListener("click", () => {
    const transcript = getTranscript();
    if (!transcript) {
      return;
    }
    input.value = transcript;
    input.focus();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = String(input.value || "").trim();

    if (!message) {
      return;
    }

    renderMessage({ sender: "user", content: message });
    input.value = "";
    setLoading(true);

    try {
      const result = await postMessage(message);
      renderMessages(result.messages || []);
      statusText.textContent = result.intent === "raise_complaint"
        ? "Complaint assistant active."
        : "Ask about status, complaints, FAQs, or navigation.";

      if (result.meta?.complaintCreated) {
        setDashboardMessage("Complaint created from chatbot.", "success");
      }
    } catch (error) {
      renderMessage({ sender: "bot", content: error.message || "The assistant could not respond right now." });
      statusText.textContent = error.message || "The assistant could not respond right now.";
    } finally {
      setLoading(false);
    }
  });

  window.addEventListener("smart-community:auth-changed", () => {
    loadHistory().catch(() => {});
  });

  window.addEventListener("smart-community:voice-transcript", () => {
    updateTranscriptButton();
  });

  updateLauncherPosition();
  updateTranscriptButton();
  loadHistory().catch(() => {});
})();
