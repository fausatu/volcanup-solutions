function normalizeCategory(value) {
	return String(value || "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function formatDisplayDate(dateValue) {
	const date = new Date(`${dateValue}T00:00:00`);
	if (Number.isNaN(date.getTime())) {
		return dateValue;
	}

	return new Intl.DateTimeFormat("fr-FR", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	}).format(date);
}

function createFeaturedMarkup(article) {
	if (!article) {
		return "";
	}

	return `
		<div class="news-featured__media" aria-hidden="true"></div>
		<div class="news-featured__content">
			<h2 class="news-featured__title">${article.title}</h2>
			<p class="news-featured__excerpt">${article.autoText}</p>
			<a class="news-featured__link" href="${article.url}" target="_blank" rel="noopener noreferrer">Lire l'article</a>
		</div>
		<a class="news-featured__cta" href="${article.url}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir l'article mis en avant">&#8594;</a>
	`;
}

function createCardMarkup(article) {
	return `
		<article class="news-card" data-category="${article.categorySlug}">
			<div class="news-card__media" aria-hidden="true"></div>
			<div class="news-card__body">
				<h3 class="news-card__title">${article.title}</h3>
				<p class="news-card__excerpt">${article.autoText}</p>
				<a class="news-card__link" href="${article.url}" target="_blank" rel="noopener noreferrer">Lire plus</a>
			</div>
			<ul class="news-card__meta" aria-label="Informations de publication">
				<li>${formatDisplayDate(article.date)}</li>
				<li>${article.categoryLabel}</li>
				<li>${article.socialNetworkLabel}</li>
			</ul>
		</article>
	`;
}

function setMediaBackground(mediaElement, imageUrl) {
	if (!mediaElement || !imageUrl) {
		return;
	}

	mediaElement.style.backgroundImage = `url("${imageUrl}")`;
	mediaElement.style.backgroundSize = "cover";
	mediaElement.style.backgroundPosition = "center";
}

async function fetchArticlesFromApi() {
	const apiBase = window.ACTUALITES_API_BASE || "http://localhost:4000/api";
	const response = await fetch(`${apiBase}/articles`, { cache: "no-store" });

	if (!response.ok) {
		throw new Error("Impossible de recuperer les articles depuis l'API");
	}

	const json = await response.json();
	if (!Array.isArray(json)) {
		return [];
	}

	const mapped = json.map((item) => {
		const categoryLabel = item.category || "Actualites";
		const categorySlug = normalizeCategory(item.category || "actualites");
		const socialNetworkLabel = String(item.socialNetwork || "social")
			.replace(/^./, (value) => value.toUpperCase());

		return {
			id: item.id,
			title: item.title,
			url: item.url,
			categoryLabel,
			categorySlug,
			date: item.date,
			createdAt: item.createdAt || null,
			autoText: item.autoText || "Extrait indisponible pour ce post.",
			autoImageUrl: item.autoImageUrl || null,
			socialNetworkLabel
		};
	});

	// Safety sort: keep newest article first even if backend ordering changes.
	mapped.sort((a, b) => {
		const dateA = Date.parse(`${a.date}T00:00:00Z`);
		const dateB = Date.parse(`${b.date}T00:00:00Z`);

		if (dateA !== dateB) {
			return dateB - dateA;
		}

		const createdA = a.createdAt ? Date.parse(a.createdAt) : 0;
		const createdB = b.createdAt ? Date.parse(b.createdAt) : 0;
		return createdB - createdA;
	});

	return mapped;
}

function setupActualitesPage() {
	const filtersContainer = document.querySelector(".news-layout__filters");
	const featured = document.querySelector(".news-featured");
	const grid = document.querySelector("[data-news-grid]");
	const pagination = document.querySelector("[data-news-pagination]");

	if (!filtersContainer || !featured || !grid || !pagination) {
		return;
	}

	let activeCategory = "all";
	let currentPage = 1;
	let items = Array.from(grid.querySelectorAll(".news-card")).map((card, index) => ({
		id: `fallback-${index}`,
		title: card.querySelector(".news-card__title")?.textContent?.trim() || "Article",
		url: card.querySelector(".news-card__link")?.getAttribute("href") || "#",
		categoryLabel: card.dataset.category || "Actualites",
		categorySlug: card.dataset.category || "actualites",
		date: "2026-01-01",
		autoText: card.querySelector(".news-card__excerpt")?.textContent?.trim() || "",
		autoImageUrl: null,
		socialNetworkLabel: "Linkedin"
	}));

	function getCardsPerPage() {
		if (window.matchMedia("(max-width: 48rem)").matches) {
			return 3;
		}

		if (window.matchMedia("(max-width: 62rem)").matches) {
			return 4;
		}

		return 6;
	}

	function getFilteredItems() {
		if (activeCategory === "all") {
			return items;
		}

		return items.filter((item) => item.categorySlug === activeCategory);
	}

	function renderFilters() {
		const categories = Array.from(new Set(items.map((item) => item.categorySlug)));
		const labels = new Map(items.map((item) => [item.categorySlug, item.categoryLabel]));

		filtersContainer.innerHTML = "";

		const allButton = document.createElement("button");
		allButton.type = "button";
		allButton.className = "news-pill";
		allButton.dataset.category = "all";
		allButton.textContent = "Tout";
		allButton.setAttribute("role", "tab");
		allButton.setAttribute("aria-selected", "true");
		filtersContainer.appendChild(allButton);

		categories.forEach((slug) => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "news-pill";
			button.dataset.category = slug;
			button.textContent = labels.get(slug) || slug;
			button.setAttribute("role", "tab");
			button.setAttribute("aria-selected", "false");
			filtersContainer.appendChild(button);
		});

		Array.from(filtersContainer.querySelectorAll(".news-pill")).forEach((button) => {
			button.addEventListener("click", () => {
				activeCategory = button.dataset.category || "all";
				currentPage = 1;
				render();
			});
		});
	}

	function renderPagination(totalPages) {
		pagination.innerHTML = "";

		if (totalPages <= 1) {
			pagination.hidden = true;
			return;
		}

		pagination.hidden = false;

		for (let index = 1; index <= totalPages; index += 1) {
			const dot = document.createElement("button");
			dot.type = "button";
			dot.className = "news-dot";
			dot.setAttribute("aria-label", `Page ${index}`);

			if (index === currentPage) {
				dot.classList.add("news-dot--active");
				dot.setAttribute("aria-current", "page");
			}

			dot.addEventListener("click", () => {
				currentPage = index;
				render();
			});

			pagination.appendChild(dot);
		}
	}

	function render() {
		const filtered = getFilteredItems();
		const featuredItem = filtered[0] || null;
		const cardsOnly = featuredItem ? filtered.slice(1) : filtered;

		featured.hidden = !featuredItem;
		if (featuredItem) {
			featured.dataset.category = featuredItem.categorySlug;
			featured.innerHTML = createFeaturedMarkup(featuredItem);
			setMediaBackground(featured.querySelector(".news-featured__media"), featuredItem.autoImageUrl);
		}

		const cardsPerPage = getCardsPerPage();
		const totalPages = Math.max(1, Math.ceil(cardsOnly.length / cardsPerPage));
		if (currentPage > totalPages) {
			currentPage = totalPages;
		}

		const start = (currentPage - 1) * cardsPerPage;
		const pagedItems = cardsOnly.slice(start, start + cardsPerPage);

		grid.innerHTML = pagedItems.map((item) => createCardMarkup(item)).join("");
		grid.querySelectorAll(".news-card").forEach((card, index) => {
			setMediaBackground(card.querySelector(".news-card__media"), pagedItems[index]?.autoImageUrl || null);
		});

		renderPagination(totalPages);

		Array.from(filtersContainer.querySelectorAll(".news-pill")).forEach((button) => {
			const isActive = (button.dataset.category || "all") === activeCategory;
			button.classList.toggle("news-pill--active", isActive);
			button.setAttribute("aria-selected", isActive ? "true" : "false");
		});
	}

	// Debounce window resize to avoid frequent reflows
	let _actualitesResizeTimeout;
	window.addEventListener("resize", () => {
		if (_actualitesResizeTimeout) clearTimeout(_actualitesResizeTimeout);
		_actualitesResizeTimeout = setTimeout(() => {
			render();
		}, 150);
	});

	fetchArticlesFromApi()
		.then((apiItems) => {
			if (apiItems.length) {
				items = apiItems;
			}
			activeCategory = "all";
			currentPage = 1;
			renderFilters();
			render();
		})
		.catch((error) => {
			console.warn("API articles indisponible, affichage local conserve:", error);
			renderFilters();
			render();
		});
}

document.addEventListener("DOMContentLoaded", setupActualitesPage);