function setupNavbarBurger(root = document) {
	const burger = root.querySelector(".navbar__burger");
	const nav = root.querySelector(".navbar__nav");

	if (!burger || !nav || burger.dataset.bound === "true") {
		return;
	}

	const closeMenu = () => {
		burger.setAttribute("aria-expanded", "false");
		burger.setAttribute("aria-label", "Ouvrir le menu");
	};

	const openMenu = () => {
		burger.setAttribute("aria-expanded", "true");
		burger.setAttribute("aria-label", "Fermer le menu");
	};

	const toggleMenu = () => {
		const isOpen = burger.getAttribute("aria-expanded") === "true";
		if (isOpen) {
			closeMenu();
			return;
		}
		openMenu();
	};

	burger.addEventListener("click", toggleMenu);

	document.addEventListener("click", (event) => {
		// Avoid expensive DOM checks when menu is closed
		const isOpen = burger.getAttribute("aria-expanded") === "true";
		if (!isOpen) return;

		if (window.matchMedia("(max-width: 62rem)").matches) {
			const clickInsideNavbar = event.target.closest(".navbar");
			if (!clickInsideNavbar) {
				closeMenu();
			}
		}
	});

	nav.querySelectorAll("a").forEach((link) => {
		link.addEventListener("click", () => {
			closeMenu();
		});
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			closeMenu();
		}
	});

	// Debounce resize handler to avoid main-thread churn
	let resizeTimeout;
	window.addEventListener("resize", () => {
		if (resizeTimeout) clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			if (!window.matchMedia("(max-width: 62rem)").matches) {
				closeMenu();
			}
		}, 150);
	});

	burger.dataset.bound = "true";
}

window.setupNavbarBurger = setupNavbarBurger;

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		setupNavbarBurger();
	});
} else {
	setupNavbarBurger();
}
