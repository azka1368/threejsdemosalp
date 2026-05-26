import * as THREE from 'three'
import { Point } from './types'

export function getGridPoint(event: MouseEvent, mount: HTMLDivElement, camera: THREE.OrthographicCamera):  Point {
    const rect = mount.getBoundingClientRect()
    const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const worldPos = new THREE.Vector3(ndcX, ndcY, 0).unproject(camera)

    return {
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y)
    }
}