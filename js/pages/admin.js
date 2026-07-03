const API_BASE = window.ADMIN_API_BASE || "http://localhost:4000/api";
const TOKEN_KEY = "volcanup_admin_access_token";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

function setStoredToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    return;
  }
  sessionStorage.removeItem(TOKEN_KEY);
}

function setFeedback(feedbackEl, message, type = "") {
  feedbackEl.textContent = message;
  feedbackEl.classList.remove("admin-feedback--error", "admin-feedback--success");
  if (type) {
    feedbackEl.classList.add(type === "error" ? "admin-feedback--error" : "admin-feedback--success");
  }
}

async function requestJson(path, options = {}) {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: mergedHeaders
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || "Erreur API";
    const issues = Array.isArray(data?.issues) ? data.issues : [];
    const error = new Error(message);
    error.issues = issues;
    error.status = response.status;
    throw error;
  }

  return data;
}

function formatValidationIssues(issues) {
  if (!Array.isArray(issues) || !issues.length) {
    return "";
  }

  return issues
    .map((issue) => {
      const field = Array.isArray(issue.path) && issue.path.length ? issue.path.join(".") : "champ";
      return `${field}: ${issue.message}`;
    })
    .join(" | ");
}

function renderArticles(listElement, articles) {
  if (!Array.isArray(articles) || !articles.length) {
    listElement.innerHTML = '<p class="admin-article-item">Aucun article publie pour le moment.</p>';
    return;
  }

  listElement.innerHTML = articles
    .map(
      (article) => `
        <article class="admin-article-item">
          <h3>${escapeHtml(article.title)}</h3>
          <div class="admin-article-meta">
            <span>${escapeHtml(article.date || "")}</span>
            <span>${escapeHtml(article.category || "")}</span>
            <span>${escapeHtml(article.socialNetwork || "")}</span>
          </div>
          <div class="admin-article-actions">
            <a class="admin-article-link" href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">Voir le post source</a>
            <button type="button" class="admin-button admin-button--danger" data-delete-article-id="${escapeHtml(article.id || "")}">Supprimer</button>
          </div>
        </article>
      `
    )
    .join("");
}

function setupAdminPage() {
  const loginPanel = document.getElementById("admin-login-panel");
  const editorPanel = document.getElementById("admin-editor-panel");
  const heroSubtitle = document.getElementById("admin-hero-subtitle");
  const loginForm = document.getElementById("admin-login-form");
  const articleForm = document.getElementById("admin-article-form");
  const refreshButton = document.getElementById("admin-refresh");
  const logoutButton = document.getElementById("admin-logout");
  const feedback = document.getElementById("admin-feedback");
  const list = document.getElementById("admin-articles-list");
  const deleteModal = document.getElementById("admin-delete-modal");
  const deleteModalMessage = document.getElementById("admin-delete-message");
  const deleteModalCancel = document.getElementById("admin-delete-cancel");
  const deleteModalConfirm = document.getElementById("admin-delete-confirm");

  if (
    !loginPanel ||
    !editorPanel ||
    !heroSubtitle ||
    !loginForm ||
    !articleForm ||
    !refreshButton ||
    !logoutButton ||
    !feedback ||
    !list ||
    !deleteModal ||
    !deleteModalMessage ||
    !deleteModalCancel ||
    !deleteModalConfirm
  ) {
    return;
  }

  let accessToken = getStoredToken();
  let pendingDeleteArticleId = "";

  function closeDeleteModal() {
    pendingDeleteArticleId = "";
    deleteModal.classList.add("admin-modal--hidden");
  }

  function openDeleteModal(articleId) {
    pendingDeleteArticleId = articleId;
    deleteModalMessage.textContent = "Cette action est definitive et supprimera l'article de la page Actualites.";
    deleteModal.classList.remove("admin-modal--hidden");
  }

  function handleUnauthorized(error) {
    if (!error || error.status !== 401) {
      return false;
    }

    accessToken = "";
    setStoredToken("");
    closeDeleteModal();
    togglePanels();
    setFeedback(feedback, "Session expiree, reconnectez-vous.", "error");
    return true;
  }

  function togglePanels() {
    const isLogged = Boolean(accessToken);
    loginPanel.classList.toggle("admin-panel--hidden", isLogged);
    editorPanel.classList.toggle("admin-panel--hidden", !isLogged);
    heroSubtitle.textContent = isLogged
      ? "Session admin active. Publiez et gerez vos articles reseaux sociaux."
      : "Connectez-vous pour ajouter des articles depuis vos posts reseaux sociaux.";
  }

  async function loadArticles() {
    try {
      const articles = await requestJson("/articles", { method: "GET" });
      renderArticles(list, articles);
    } catch (error) {
      setFeedback(feedback, `Chargement impossible: ${error.message}`, "error");
    }
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const payload = {
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || "")
    };

    try {
      const data = await requestJson("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      accessToken = data.accessToken;
      setStoredToken(accessToken);
      loginForm.reset();
      togglePanels();
      setFeedback(feedback, "Connexion reussie.", "success");
    } catch (error) {
      setFeedback(feedback, `Connexion refusee: ${error.message}`, "error");
    }
  });

  articleForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!accessToken) {
      setFeedback(feedback, "Session expiree, reconnectez-vous.", "error");
      togglePanels();
      return;
    }

    const formData = new FormData(articleForm);
    const payload = {
      title: String(formData.get("title") || "").trim(),
      url: String(formData.get("url") || "").trim(),
      category: String(formData.get("category") || "").trim(),
      date: String(formData.get("date") || "").trim(),
      socialNetwork: String(formData.get("socialNetwork") || "").trim().toLowerCase(),
      excerpt: String(formData.get("excerpt") || "").trim() || undefined
    };

    try {
      await requestJson("/admin/articles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      articleForm.reset();
      setFeedback(feedback, "Article publie avec succes.", "success");
      await loadArticles();
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      const details = formatValidationIssues(error.issues);
      const suffix = details ? ` (${details})` : "";
      setFeedback(feedback, `Publication echouee: ${error.message}${suffix}`, "error");
    }
  });

  refreshButton.addEventListener("click", async () => {
    await loadArticles();
    setFeedback(feedback, "Liste actualisee.", "success");
  });

  list.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const deleteButton = target.closest("[data-delete-article-id]");
    if (!(deleteButton instanceof HTMLElement)) {
      return;
    }

    const articleId = deleteButton.getAttribute("data-delete-article-id") || "";
    if (!articleId) {
      setFeedback(feedback, "Suppression impossible: article invalide.", "error");
      return;
    }

    if (!accessToken) {
      setFeedback(feedback, "Session expiree, reconnectez-vous.", "error");
      togglePanels();
      return;
    }

    openDeleteModal(articleId);
  });

  deleteModalCancel.addEventListener("click", () => {
    closeDeleteModal();
  });

  deleteModal.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
      closeDeleteModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !deleteModal.classList.contains("admin-modal--hidden")) {
      closeDeleteModal();
    }
  });

  deleteModalConfirm.addEventListener("click", async () => {
    if (!pendingDeleteArticleId) {
      closeDeleteModal();
      return;
    }

    if (!accessToken) {
      closeDeleteModal();
      setFeedback(feedback, "Session expiree, reconnectez-vous.", "error");
      togglePanels();
      return;
    }

    try {
      await requestJson(`/admin/articles/${encodeURIComponent(pendingDeleteArticleId)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      closeDeleteModal();
      setFeedback(feedback, "Article supprime avec succes.", "success");
      await loadArticles();
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      closeDeleteModal();
      setFeedback(feedback, `Suppression echouee: ${error.message}`, "error");
    }
  });

  logoutButton.addEventListener("click", () => {
    accessToken = "";
    setStoredToken("");
    togglePanels();
    setFeedback(feedback, "Vous etes deconnecte.", "success");
  });

  togglePanels();
  loadArticles();
}

document.addEventListener("DOMContentLoaded", setupAdminPage);
