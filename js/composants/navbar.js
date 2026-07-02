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

	window.addEventListener("resize", () => {
		if (!window.matchMedia("(max-width: 62rem)").matches) {
			closeMenu();
		}
	});

	burger.dataset.bound = "true";
}

document.addEventListener("DOMContentLoaded", () => {
	setupNavbarBurger();
});
