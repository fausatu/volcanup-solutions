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

function setActiveNavbarLink(root = document) {
	const currentPage = normalizePageName(window.location.pathname);
	const links = root.querySelectorAll(".navbar__link");

	links.forEach((link) => {
		const linkTarget = (link.getAttribute("href") || "").toLowerCase();
		const isHomeAlias = currentPage === "" || currentPage === "/";
		const isMatch = linkTarget === currentPage || (isHomeAlias && linkTarget === "index.html");
		link.classList.toggle("navbar__link--active", isMatch);
	});
}

async function injectNavbar() {
	const slot = document.getElementById("navbar-slot");
	if (!slot) {
		return;
	}

	const componentPath = slot.dataset.component || "Composants/navbar.partial.html";
	const scriptPath = slot.dataset.script || "js/composants/navbar.js";

	try {
		const response = await fetch(componentPath, { cache: "no-store" });
		if (!response.ok) {
			throw new Error(`Impossible de charger ${componentPath}`);
		}

		slot.innerHTML = await response.text();
		await loadScriptOnce(scriptPath);

		if (typeof window.setupNavbarBurger === "function") {
			window.setupNavbarBurger(slot);
		}

		setActiveNavbarLink(slot);
	} catch (error) {
		console.error("Erreur injection navbar:", error);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	injectNavbar();
});
