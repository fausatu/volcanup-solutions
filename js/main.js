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


// Rewrite known third-party image URLs to the local proxy endpoint so browsers
// receive long cache headers from our backend. This runs as early as possible
// on DOMContentLoaded to reduce cold fetches to third-party hosts.
function proxyThirdPartyImages() {
	const HOST = "media.licdn.com";
	const images = document.querySelectorAll(`img[src*="${HOST}"], img[srcset*="${HOST}"]`);
	if (!images.length) return;

	images.forEach((img) => {
		const src = img.getAttribute("src");
		if (src && src.includes(HOST)) {
			img.setAttribute("src", "/proxy/image?url=" + encodeURIComponent(src));
		}

		const srcset = img.getAttribute("srcset");
		if (srcset && srcset.includes(HOST)) {
			const newSrcset = srcset
				.split(",")
				.map((part) => {
					const p = part.trim();
					const [url, descriptor] = p.split(/\s+/);
					if (url && url.includes(HOST)) {
						return "/proxy/image?url=" + encodeURIComponent(url) + (descriptor ? " " + descriptor : "");
					}
					return p;
				})
				.join(", ");
			img.setAttribute("srcset", newSrcset);
		}
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", proxyThirdPartyImages, { once: true });
} else {
	proxyThirdPartyImages();
}

/**
 * Normalise le nom de page depuis l'URL du navigateur.
 * Supporte à la fois les URLs locales (avec .html) et les clean URLs Netlify (sans .html).
 */
function normalizePageName(pathname) {
	const fileName = pathname.split("/").pop() || "";
	if (!fileName) {
		return "index";
	}
	// Netlify utilise des "clean URLs" sans .html.
	// En local, l'URL contient .html.
	// On retire .html pour comparer des noms de page "propres".
	const name = fileName.toLowerCase();
	return name.replace(/\.html$/, "");
}

<<<<<<< Updated upstream
=======
async function injectComponent(slotId, componentPath) {
	const slot = document.getElementById(slotId);
	if (!slot) {
		return null;
	}

	const resolvedPath = slot.dataset.component || componentPath;
	const response = await fetch(resolvedPath);
	if (!response.ok) {
		throw new Error(`Impossible de charger ${resolvedPath}`);
	}

	slot.innerHTML = await response.text();
	return slot;
}

/**
 * Normalise la cible d'un lien de la navbar.
 * Retire l'extension .html et met en minuscules pour comparer avec normalizePageName().
 */
function normalizeLinkTarget(href) {
	if (!href) {
		return "";
	}

	const cleanHref = href.split("#")[0].split("?")[0];
	const fileName = cleanHref.split("/").pop() || "index.html";
	const name = fileName.toLowerCase();
	return name.replace(/\.html$/, "");
}

function setActiveNavbarLink(root = document) {
	const currentPage = normalizePageName(window.location.pathname);
	const links = root.querySelectorAll(".navbar__link");

	links.forEach((link) => {
		const linkTarget = normalizeLinkTarget(link.getAttribute("href"));
		// Si currentPage est vide ou "/", on est sur la page d'accueil (index)
		const isHome = currentPage === "" || currentPage === "/" || currentPage === "index";
		const isMatch = linkTarget === currentPage || (isHome && linkTarget === "index");
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
<<<<<<< Updated upstream
});
=======
	injectFooter();
	setupHeroSectionScrollLinks();
}

function runAfterLCP(callback, fallbackMs = 2500) {
	let called = false;
	try {
		const po = new PerformanceObserver((list) => {
			if (called) return;
			const entries = list.getEntries();
			if (entries && entries.length) {
				called = true;
				try { po.disconnect(); } catch (e) {}
				callback();
			}
		});
		po.observe({ type: 'largest-contentful-paint', buffered: true });
	} catch (e) {
		// PerformanceObserver for LCP not supported
	}

	// Fallback in case LCP isn't reported quickly
	setTimeout(() => {
		if (!called) {
			called = true;
			callback();
		}
	}, fallbackMs);
}

if ("requestIdleCallback" in window) {
	requestIdleCallback(() => runAfterLCP(initPageScripts), { timeout: 2000 });
} else {
	window.addEventListener("load", () => runAfterLCP(initPageScripts));
}

