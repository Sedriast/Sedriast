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
const section3 = document.getElementById('section-3');

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
	// 0-15% scroll = 0-100 frames
	// 15-58% scroll = 100-200 frames
	// 58-83% scroll = 200-300 frames (hasta el último frame)
	// 83-100% scroll = animación desaparece y aparece sección 3
	let targetFrame;
	if (scrollFraction < 0.15) {
		targetFrame = Math.floor((scrollFraction / 0.15) * 100);
	} else if (scrollFraction < 0.58) {
		targetFrame = 100 + Math.floor(((scrollFraction - 0.15) / 0.43) * 100);
	} else if (scrollFraction < 0.83) {
		// Fase 3a: completar hasta el frame 300
		targetFrame = 200 + Math.floor(((scrollFraction - 0.58) / 0.25) * 100);
	} else {
		// Fase 3b: mantener en el último frame mientras desaparece
		targetFrame = 299;
	}
	targetFrame = Math.min(targetFrame, CONFIG.totalFrames - 1);

	// Fase 1 (0-15%): Primera sección visible, se desvanece MUY rápido
	const phase1Progress = Math.min(scrollFraction / 0.15, 1);
	const section1Opacity = Math.max(1 - phase1Progress, 0);

	// Fase 2 (15-83%): Segunda sección aparece MUCHO MÁS TEMPRANO y permanece hasta el último frame
	const phase2Start = 0.15; // Antes era 0.25, ahora 0.15
	const phase2End = 0.83;
	let section2Translate, section2Opacity, section2Scale, section2Blur;

	if (scrollFraction < phase2Start) {
		// Antes de fase 2: invisible abajo
		section2Translate = 100;
		section2Opacity = 0;
		section2Scale = 1;
		section2Blur = 0;
	} else if (scrollFraction < phase2End) {
		// Fase 2: sube y permanece visible
		const phase2Progress = (scrollFraction - phase2Start) / (phase2End - phase2Start);
		const enterProgress = Math.min(phase2Progress * 3, 1); // Sube rápido en el primer tercio
		section2Translate = Math.max(100 - (enterProgress * 100), 0);
		section2Opacity = enterProgress;
		section2Scale = 1;
		section2Blur = 0;
	} else {
		// Después del último frame: se EXPANDE y difumina (igual que la animación)
		const exitProgress = Math.min((scrollFraction - phase2End) / 0.08, 1); // En 8% de scroll
		section2Translate = 0;
		section2Scale = 1 + (exitProgress * 1.5); // De 1.0 a 2.5 (se expande)
		section2Blur = exitProgress * 20; // De 0 a 20px (se difumina)
		section2Opacity = Math.max(1 - (exitProgress * 1.2), 0); // Desaparece
	}

	// Fase 3a (58-83%): Animación completa hasta frame 300
	// Fase 3b (83-100%): Animación desaparece, luego aparece sección 3
	const phase3aProgress = Math.max(Math.min((scrollFraction - 0.58) / 0.25, 1), 0);
	const phase3bProgress = Math.max((scrollFraction - 0.83) / 0.17, 0);

	// La animación permanece normal hasta el 83%, luego se EXPANDE y difumina
	let animationScale, animationBlur, animationOpacity;
	if (scrollFraction < 0.83) {
		// Fase 1, 2, 3a: animación normal
		animationScale = 1;
		animationBlur = 0;
		animationOpacity = 1;
	} else {
		// Fase 3b: animación se expande y desaparece (primera mitad de 83-100%)
		const animationPhase = Math.min(phase3bProgress * 2, 1);
		animationScale = 1 + (animationPhase * 1.5); // De 1.0 a 2.5
		animationBlur = animationPhase * 20; // De 0 a 20px
		animationOpacity = Math.max(1 - (animationPhase * 1.2), 0);
	}

	// La sección 3 aparece MUCHO MÁS TEMPRANO, casi inmediatamente después del último frame
	const section3Phase = Math.max((phase3bProgress - 0.15) * 1.18, 0); // Empieza al 15% de fase 3b
	const section3Scale = 0.5 + (section3Phase * 0.5); // De 0.5 a 1.0
	const section3Opacity = Math.min(section3Phase * 1.5, 1);
	const section3Blur = Math.max(10 - (section3Phase * 10), 0); // Desenfoque inicial

	// Aplicar transformaciones a las secciones
	section1.style.transform = 'translateY(0)';
	section1.style.opacity = section1Opacity;

	section2.style.transform = `translateY(${section2Translate}%) scale(${section2Scale})`;
	section2.style.opacity = section2Opacity;
	section2.style.filter = `blur(${section2Blur}px)`;

	section3.style.transform = `scale(${section3Scale})`;
	section3.style.opacity = section3Opacity;
	section3.style.filter = `blur(${section3Blur}px)`;

	// Aplicar expansión y difuminado a la animación
	AnimationFrame.style.transform = `scale(${animationScale})`;
	AnimationFrame.style.opacity = animationOpacity;
	AnimationFrame.style.filter = `blur(${animationBlur}px)`;

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