async function loadScriptOnce(src) {
	if (document.querySelector(`script[data-loader-src="${src}"]`)) {
		return;
	}

	await new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.defer = true;
		script.dataset.loaderSrc = src;
		script.addEventListener("load", resolve, { once: true });
		script.addEventListener("error", reject, { once: true });
		document.body.appendChild(script);
	});
}

function normalizePageName(pathname) {
	const fileName = pathname.split("/").pop() || "";
	if (!fileName) {
		return "index.html";
	}
	return fileName.toLowerCase();
}

async function injectComponent(slotId, componentPath) {
	const slot = document.getElementById(slotId);
	if (!slot) {
		return null;
	}

	const resolvedPath = slot.dataset.component || componentPath;
	const response = await fetch(resolvedPath, { cache: "no-store" });
	if (!response.ok) {
		throw new Error(`Impossible de charger ${resolvedPath}`);
	}

	slot.innerHTML = await response.text();
	return slot;
}

function normalizeLinkTarget(href) {
	if (!href) {
		return "";
	}

	const cleanHref = href.split("#")[0].split("?")[0];
	const fileName = cleanHref.split("/").pop() || "index.html";
	return fileName.toLowerCase();
}

function setActiveNavbarLink(root = document) {
	const currentPage = normalizePageName(window.location.pathname);
	const links = root.querySelectorAll(".navbar__link");

	links.forEach((link) => {
		const linkTarget = normalizeLinkTarget(link.getAttribute("href"));
		const isHomeAlias = currentPage === "" || currentPage === "/";
		const isMatch = linkTarget === currentPage || (isHomeAlias && linkTarget === "index.html");
		link.classList.toggle("navbar__link--active", isMatch);
	});
}

function setupHeroSectionScrollLinks(root = document) {
	const links = root.querySelectorAll('.services-hero__actions a[href^="#"]');
	if (!links.length) {
		return;
	}

	const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	links.forEach((link) => {
		link.addEventListener("click", (event) => {
			const href = link.getAttribute("href") || "";
			if (!href.startsWith("#")) {
				return;
			}

			event.preventDefault();
			const target = document.querySelector(href);
			if (!target) {
				return;
			}

			const navbarHeightVar = getComputedStyle(document.documentElement).getPropertyValue("--navbar-height").trim();
			const navbarHeight = Number.parseFloat(navbarHeightVar) || 72;
			const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 8;

			window.scrollTo({
				top: Math.max(0, targetTop),
				behavior: prefersReducedMotion ? "auto" : "smooth",
			});

			history.replaceState(null, "", href);
		});
	});
}

async function injectNavbar() {
	const slot = document.getElementById("navbar-slot");
	if (!slot) {
		return;
	}

	const scriptPath = slot.dataset.script || "js/composants/navbar.js";

	try {
		await injectComponent("navbar-slot", "Composants/navbar.partial.html");
		await loadScriptOnce(scriptPath);

		if (typeof window.setupNavbarBurger === "function") {
			window.setupNavbarBurger(slot);
		}

		setActiveNavbarLink(slot);
	} catch (error) {
		console.error("Erreur injection navbar:", error);
	}
}

async function injectFooter() {
	try {
		await injectComponent("footer-slot", "Composants/footer.partial.html");
	} catch (error) {
		console.error("Erreur injection footer:", error);
	}
}

function initPageScripts() {
	injectNavbar();
	injectFooter();
	setupHeroSectionScrollLinks();
}

if ("requestIdleCallback" in window) {
	requestIdleCallback(initPageScripts, { timeout: 2000 });
} else {
	window.addEventListener("load", initPageScripts);
}
