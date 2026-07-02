function setupActualitesPage() {
	const filterButtons = Array.from(document.querySelectorAll(".news-pill"));
	const cards = Array.from(document.querySelectorAll(".news-card"));
	const featured = document.querySelector(".news-featured");
	const pagination = document.querySelector("[data-news-pagination]");

	if (!filterButtons.length || !cards.length || !pagination) {
		return;
	}

	let activeCategory = "all";
	let currentPage = 1;

	function getCardsPerPage() {
		if (window.matchMedia("(max-width: 48rem)").matches) {
			return 3;
		}

		if (window.matchMedia("(max-width: 62rem)").matches) {
			return 4;
		}

		return 6;
	}

	function getFilteredCards() {
		if (activeCategory === "all") {
			return cards;
		}

		return cards.filter((card) => card.dataset.category === activeCategory);
	}

	function updateFeaturedVisibility() {
		if (!featured) {
			return;
		}

		const featuredCategory = featured.dataset.category || "all";
		const isVisible = activeCategory === "all" || featuredCategory === activeCategory;
		featured.hidden = !isVisible;
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
			dot.dataset.page = String(index);

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

	function renderCards() {
		const filteredCards = getFilteredCards();
		const cardsPerPage = getCardsPerPage();
		const totalPages = Math.max(1, Math.ceil(filteredCards.length / cardsPerPage));

		if (currentPage > totalPages) {
			currentPage = totalPages;
		}

		const start = (currentPage - 1) * cardsPerPage;
		const end = start + cardsPerPage;
		const visibleCards = filteredCards.slice(start, end);

		cards.forEach((card) => {
			card.hidden = !visibleCards.includes(card);
		});

		renderPagination(totalPages);
	}

	function render() {
		updateFeaturedVisibility();
		renderCards();
	}

	filterButtons.forEach((button) => {
		button.addEventListener("click", () => {
			activeCategory = button.dataset.category || "all";
			currentPage = 1;

			filterButtons.forEach((item) => {
				const isActive = item === button;
				item.classList.toggle("news-pill--active", isActive);
				item.setAttribute("aria-selected", isActive ? "true" : "false");
			});

			render();
		});
	});

	window.addEventListener("resize", render);
	render();
}

document.addEventListener("DOMContentLoaded", setupActualitesPage);