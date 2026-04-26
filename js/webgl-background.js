/**
 * E-Obra WebGL Background
 * ============================================================
 * Atmospheric floating particles with sepia/gold tones
 * using Three.js for an immersive, historical ambiance.
 * ============================================================
 */

(function () {
    'use strict';

    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    let scene, camera, renderer;
    let particles, dustParticles;
    let mouseX = 0, mouseY = 0;
    let animationId;

    const PARTICLE_COUNT = 120;
    const DUST_COUNT = 200;

    function init() {
        // Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x1A1410, 0.002);

        // Camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.z = 500;

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x1A1410, 1);

        // Create particle systems
        createMainParticles();
        createDustParticles();
        createAmbientLight();

        // Events
        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onMouseMove, false);

        // Start
        animate();
    }

    function createMainParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);
        const velocities = new Float32Array(PARTICLE_COUNT * 3);

        const goldColor = new THREE.Color(0xC9A84C);
        const sepiaColor = new THREE.Color(0x704214);
        const parchmentColor = new THREE.Color(0xF5E6C8);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            positions[i3] = (Math.random() - 0.5) * 1600;
            positions[i3 + 1] = (Math.random() - 0.5) * 1200;
            positions[i3 + 2] = (Math.random() - 0.5) * 800;

            // Random color from palette
            const colorChoice = Math.random();
            let color;
            if (colorChoice < 0.4) color = goldColor;
            else if (colorChoice < 0.7) color = sepiaColor;
            else color = parchmentColor;

            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = Math.random() * 3 + 1;

            // Velocity
            velocities[i3] = (Math.random() - 0.5) * 0.3;
            velocities[i3 + 1] = Math.random() * 0.2 + 0.05; // Upward drift
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 2.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        particles = new THREE.Points(geometry, material);
        particles.userData.velocities = velocities;
        scene.add(particles);
    }

    function createDustParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(DUST_COUNT * 3);

        for (let i = 0; i < DUST_COUNT; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 2000;
            positions[i3 + 1] = (Math.random() - 0.5) * 1500;
            positions[i3 + 2] = (Math.random() - 0.5) * 1000;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 1,
            color: 0x8B7355,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        dustParticles = new THREE.Points(geometry, material);
        scene.add(dustParticles);
    }

    function createAmbientLight() {
        const light1 = new THREE.PointLight(0xC9A84C, 0.5, 1000);
        light1.position.set(300, 200, 400);
        scene.add(light1);

        const light2 = new THREE.PointLight(0x704214, 0.3, 800);
        light2.position.set(-200, -100, 300);
        scene.add(light2);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseMove(e) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        const time = Date.now() * 0.0005;

        // Animate main particles
        if (particles) {
            const positions = particles.geometry.attributes.position.array;
            const velocities = particles.userData.velocities;

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;

                positions[i3] += velocities[i3] + Math.sin(time + i * 0.1) * 0.05;
                positions[i3 + 1] += velocities[i3 + 1];
                positions[i3 + 2] += velocities[i3 + 2];

                // Wrap around
                if (positions[i3 + 1] > 600) positions[i3 + 1] = -600;
                if (positions[i3] > 800) positions[i3] = -800;
                if (positions[i3] < -800) positions[i3] = 800;
            }

            particles.geometry.attributes.position.needsUpdate = true;
            particles.rotation.y = time * 0.05;
        }

        // Animate dust
        if (dustParticles) {
            dustParticles.rotation.y = time * 0.02;
            dustParticles.rotation.x = Math.sin(time * 0.3) * 0.02;
        }

        // Camera parallax
        camera.position.x += (mouseX * 30 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 20 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', function () {
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) renderer.dispose();
    });
})();
