const CONFIG = {
	totalFrames: 300,
	framesPath: 'assets/pencilSketchClip/',
	throttleDelay: 30
};
let currentFrame = 0, lastScrollTime = 0, imageCache = [];
const AnimationFrame = document.getElementById('motorcycle-frame');
const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.querySelector('.loading-text');

function getFramePath(index) {
	return CONFIG.framesPath + (index + 1).toString().padStart(4, '0') + '.webp';
}

function preloadImages() {
	return new Promise(function (resolve) {
		let loadedCount = 0;
		for (let i = 0; i < CONFIG.totalFrames; i++) {
			const img = new Image(); img.src = getFramePath(i); img.onload = function () { loadedCount++; if (loadedCount === CONFIG.totalFrames) { resolve(); } }; img.onerror = function () { loadedCount++; if (loadedCount === CONFIG.totalFrames) { resolve(); } }; imageCache.push(img);
		}
	});
}
function updateFrame() {
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
	const scrollFraction = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
	const targetFrame = Math.min(Math.floor(scrollFraction * CONFIG.totalFrames), CONFIG.totalFrames - 1);
	if (targetFrame !== currentFrame) {
		currentFrame = targetFrame;
		AnimationFrame.src = getFramePath(currentFrame);
	}
}
function handleScroll() {
	const now = Date.now();
	if (now - lastScrollTime >= CONFIG.throttleDelay) {
		lastScrollTime = now; requestAnimationFrame(updateFrame);
	}
}
async function init() {
	loadingText.textContent = 'Cargando...';
	await preloadImages();
	loadingText.textContent = 'Listo';
	setTimeout(function () {
		loadingScreen.classList.add('hidden');
		AnimationFrame.src = getFramePath(0);
		window.addEventListener('scroll', handleScroll, { passive: true });
		updateFrame();
	}, 500);
}
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}