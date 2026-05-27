import * as THREE from 'three'

export function createOrbitTrail(orbitRadius: number, color: number) {
    const points = [];
        const segments = 128;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                orbitRadius * Math.cos(angle),
                0,
                orbitRadius * Math.sin(angle)
            ));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color, opacity: 0.5, transparent: true });
        return new THREE.Line(geometry, material);
}