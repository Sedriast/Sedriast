const CONFIG = {
	totalFrames: 300,
	framesPath: 'assets/pencilSketchClip/',
	throttleDelay: 30
};
let currentFrame = 0, lastScrollTime = 0, imageCache = [];
const AnimationFrame = document.getElementById('animation-frame');
const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.querySelector('.loading-text');
const section1 = document.getElementById('section-1');
const section2 = document.getElementById('section-2');

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

	// Calcular el frame según el scroll:
	// 0-50% scroll = 0-150 frames (50% de la animación)
	// 50-100% scroll = 150-300 frames (50% restante)
	let targetFrame;
	if (scrollFraction < 0.5) {
		// Primera mitad: progresa hasta el frame 150
		targetFrame = Math.floor((scrollFraction / 0.5) * 150);
	} else {
		// Segunda mitad: progresa del frame 150 al 300
		targetFrame = 150 + Math.floor(((scrollFraction - 0.5) / 0.5) * 150);
	}
	targetFrame = Math.min(targetFrame, CONFIG.totalFrames - 1);

	// Controlar desplazamiento de secciones según el progreso
	// Primera sección: solo se desvanece, sin moverse
	const section1Opacity = Math.max(1 - (scrollFraction * 2), 0); // Se desvanece al 50%

	// Segunda sección: empieza abajo y sube con el scroll hasta detenerse en su posición
	const section2Translate = Math.max(100 - (scrollFraction * 200), 0); // Se detiene en 0% al llegar al 50%
	const section2Opacity = Math.min(scrollFraction * 2, 1); // Aparece gradualmente

	section1.style.transform = 'translateY(0)';
	section1.style.opacity = section1Opacity;

	section2.style.transform = `translateY(${section2Translate}%)`;
	section2.style.opacity = section2Opacity;

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