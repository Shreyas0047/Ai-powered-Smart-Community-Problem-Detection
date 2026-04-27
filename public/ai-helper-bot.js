(function () {
  const launcher = document.getElementById("chatbotLauncher");
  const contextTip = document.getElementById("aiHelperContextTip");

  if (!launcher || !contextTip) {
    return;
  }

  let chatbotState = "idle";
  let voiceState = "idle";

  const contextMap = {
    reportFormWorkspace: "You can describe your issue here",
    adminWorkspace: "Check your complaint status here",
    complaintsWorkspace: "Review your recent complaint history here",
    mapWorkspace: "Verify the live location preview here"
  };

  function getEffectiveState() {
    if (voiceState === "error" || chatbotState === "error") {
      return "error";
    }

    if (voiceState === "listening") {
      return "listening";
    }

    if (voiceState === "processing" || chatbotState === "talking") {
      return "talking";
    }

    if (chatbotState === "open") {
      return "open";
    }

    return "idle";
  }

  function updateState() {
    launcher.dataset.botState = getEffectiveState();
  }

  function getVisibleContext() {
    const entries = Object.keys(contextMap)
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        return {
          id: element.id,
          visibleHeight
        };
      })
      .filter((entry) => entry.visibleHeight > 40)
      .sort((a, b) => b.visibleHeight - a.visibleHeight);

    return entries[0]?.id || "adminWorkspace";
  }

  function updateContextTip() {
    const contextId = getVisibleContext();
    contextTip.textContent = contextMap[contextId] || "Hi! Need help?";
  }

  window.addEventListener("smart-community:chatbot-state", (event) => {
    chatbotState = String(event.detail?.state || "idle");
    updateState();
  });

  window.addEventListener("smart-community:voice-state", (event) => {
    voiceState = String(event.detail?.state || "idle");
    updateState();

    if (voiceState === "error" || voiceState === "processing") {
      window.setTimeout(() => {
        voiceState = "idle";
        updateState();
      }, 1100);
    }
  });

  window.addEventListener("smart-community:voice-transcript", () => {
    voiceState = "idle";
    updateState();
  });

  window.addEventListener("scroll", updateContextTip, { passive: true });
  window.addEventListener("resize", updateContextTip);
  window.addEventListener("hashchange", updateContextTip);

  updateContextTip();
  updateState();
})();
