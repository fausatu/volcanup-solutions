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
	const response = await fetch(resolvedPath);
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
