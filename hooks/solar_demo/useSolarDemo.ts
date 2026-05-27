'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createOrbitTrail } from '../../lib/solar_demo/createOrbitTrail';

export function useSolarDemo() {
    // constants
    const sunSize = 2.5;
    const planet1Size = 0.5;
    const planet2Size = 0.75;
    const planet3Size = 1.25;
    const moonSize = 0.25;
    const planet1Radius = 4.5;
    const planet2Radius = 8;
    const planet3Radius = 14;
    const moonRadius = 2.5;
    const padding = 1.2;

    // variables
    let orbitSpeed = 1.0;
    let planet1Speed = 0.55 * orbitSpeed;
    let planet2Speed = 0.275 * orbitSpeed;
    let planet3Speed = 0.33 * orbitSpeed;
    let moonSpeed = 11 * orbitSpeed;

    // references - allow me to access threejs things from outside of the useEffect hook.
    const mountRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const animateRef = useRef<(() => void)>(() => {}); 
    const clockRef = useRef<THREE.Clock>(new THREE.Clock());
    const elapsedRef = useRef<number>(0);

    useEffect(() => {
        const mount = mountRef.current!;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        // make camera look at the origin
        const fovRad = (camera.fov * Math.PI) / 180;
        const maxRadius = planet3Radius + moonRadius + moonSize; // planet3's orbit + the furthest extent of the moon
        const distance = (maxRadius * padding) / (Math.tan(fovRad / 2) * Math.min(1, camera.aspect));

        camera.position.set(0, distance, 0);
        camera.target = new THREE.Vector3(0, 0, 0);
        camera.lookAt(camera.target);

        // ensures canvas remains at full size if window size changes.
        window.addEventListener('resize', function() {
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
            const newDistance = (maxRadius * padding) / (Math.tan(fovRad / 2) * Math.min(1, camera.aspect));
            camera.position.set(0, newDistance, 0);
            renderer.render(scene, camera);
        });

        // create the sun
        const sunGeometry = new THREE.SphereGeometry(sunSize, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        scene.add(sun);

        // create planet 1
        const planet1Geometry = new THREE.SphereGeometry(planet1Size, 16, 16);
        const planet1Material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const planet1 = new THREE.Mesh(planet1Geometry, planet1Material);
        scene.add(planet1);
        planet1.position.set(planet1Radius, 0, 0);

        // create planet 2
        const planet2Geometry = new THREE.SphereGeometry(planet2Size, 20, 20);
        const planet2Material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const planet2 = new THREE.Mesh(planet2Geometry, planet2Material);
        scene.add(planet2);
        planet2.position.set(planet2Radius, 0, 0);

        // create planet 3
        const planet3Geometry = new THREE.SphereGeometry(planet3Size, 24, 24);
        const planet3Material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const planet3 = new THREE.Mesh(planet3Geometry, planet3Material);
        scene.add(planet3);
        planet3.position.set(planet3Radius, 0, 0);

        // create a moon for planet 3
        const moonGeometry = new THREE.SphereGeometry(moonSize, 12, 12);
        const moonMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        scene.add(moon);
        moon.position.set(planet3Radius - moonRadius, 0, 0);

        // lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
        scene.add(ambientLight);

        const ptLight = new THREE.PointLight(0xffffff, 850);
        scene.add(ptLight);

        // create orbit trails
        const p1Orbit = scene.add(createOrbitTrail(planet1Radius, 0x00ff00));
        const p2Orbit = scene.add(createOrbitTrail(planet2Radius, 0x0000ff));
        const p3Orbit = scene.add(createOrbitTrail(planet3Radius, 0xff0000));
        const moonOrbit = createOrbitTrail(moonRadius, 0xffffff);
        moonOrbit.position.x = planet3.position.x;
        moonOrbit.position.z = planet3.position.y;
        scene.add(moonOrbit);

        // keep all initial graphics code above this
        renderer.render(scene, camera);

        // Animation loop
        animateRef.current = () => {
            animationRef.current = requestAnimationFrame(animateRef.current);
            elapsedRef.current += clockRef.current.getDelta();
            const t = elapsedRef.current;

            planet1.position.x = planet1Radius * Math.cos(t * planet1Speed);
            planet1.position.z = planet1Radius * Math.sin(t * planet1Speed);

            planet2.position.x = planet2Radius * Math.cos(t * planet2Speed);
            planet2.position.z = planet2Radius * Math.sin(t * planet2Speed);

            planet3.position.x = planet3Radius * Math.cos(t * planet3Speed);
            planet3.position.z = planet3Radius * Math.sin(t * planet3Speed);

            moon.position.x = planet3.position.x - moonRadius * Math.cos(t * moonSpeed);
            moon.position.z = planet3.position.z + moonRadius * Math.sin(t * moonSpeed);

            moonOrbit.position.x = planet3Radius * Math.cos(t * planet3Speed);
            moonOrbit.position.z = planet3Radius * Math.sin(t * planet3Speed);

            renderer.render(scene, camera);
        };

        // Cleanup when leaving the page
        return () => {
            scene.remove(sun)
            sun.geometry.dispose()
            sun.material.dispose()

            scene.remove(planet1)
            planet1.geometry.dispose()
            planet1.material.dispose()


            scene.remove(planet2)
            planet2.geometry.dispose()
            planet2.material.dispose()

            scene.remove(planet3)
            planet3.geometry.dispose()
            planet3.material.dispose()

            scene.remove(moon)
            moon.geometry.dispose()
            moon.material.dispose()

            scene.remove(p1Orbit)
            p1Orbit.geometry.dispose()
            p1Orbit.material.dispose()

            scene.remove(p2Orbit)
            p2Orbit.geometry.dispose()
            p2Orbit.material.dispose()

            scene.remove(p3Orbit)
            p3Orbit.geometry.dispose()
            p3Orbit.material.dispose()

            scene.remove(moonOrbit)
            moonOrbit.geometry.dispose()
            moonOrbit.material.dispose()

            scene.remove(ambientLight)
            scene.remove(ptLight)

            mount.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return {
        mountRef,
        animateRef,
        animationRef,
        clockRef
    }
}