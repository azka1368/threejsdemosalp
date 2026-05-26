'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import AddShape from '../../components/math_demo/AddShape'
import CancelShape from '../../components/math_demo/CancelShape'
import TransformControls from '../../components/math_demo/TransformControls'
import { DemoState, Point } from '../../lib/math_demo/types'
import { applyTranslation, applyDilation, applyRotation, applyReflection } from '../../lib/math_demo/applyTransform'
import { clearPreview } from '../../lib/math_demo/clearPreview'
import { createShape } from '../../lib/math_demo/createShape'
import { createAxes } from '../../lib/math_demo/createAxes'
import { createGrid } from '../../lib/math_demo/createGrid'
import { getGridPoint } from '../../lib/math_demo/getGridPoint'
import { updateShapeMesh } from '../../lib/math_demo/updateShapeMesh'

export default function page() {
    // math demo
    // TODO: find a way to make grid expand/contract with zoom or just make a bigger grid.

    const mountRef = useRef<HTMLDivElement>(null)
    const [demoState, setDemoState] = useState('idle')
    const [pointCount, setPointCount] = useState(0)

    // refs for creating shapes
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
    const placedPointsRef = useRef<{x: number, y: number}[]>([])
    const previewDotsRef = useRef<THREE.Mesh[]>([])
    const previewLineRef = useRef<THREE.Line | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const shapeMeshRef = useRef<THREE.Mesh | null>(null)
    const originalPointsRef = useRef<{x: number, y: number}[]>([])
    const currentPointsRef = useRef<{x: number, y: number}[]>([])
    const stateRef = useRef<DemoState>('idle')

    // keep the ref in sync with state so Three.js handlers see current value
    const handleTogglePlacing = () => {
        if (stateRef.current === 'idle') {
            // start placing
            stateRef.current = 'placing'
            setDemoState('placing')
        
        } else if (stateRef.current === 'placing') {
            // confirm shape — need at least 3 points
            if (placedPointsRef.current.length < 3) return
            
            shapeMeshRef.current = createShape(sceneRef.current, placedPointsRef.current)
            originalPointsRef.current = [...placedPointsRef.current]
            currentPointsRef.current = [...placedPointsRef.current]
            clearPreview(sceneRef.current!, previewDotsRef.current!, previewLineRef.current)
            placedPointsRef.current = []
            
            stateRef.current = 'transforming'
            setDemoState('transforming')
        }
    }

    const handleCancelPlacing = () => {
        clearPreview(sceneRef.current!, previewDotsRef.current!, previewLineRef.current)
        placedPointsRef.current = []
        setPointCount(0)
        stateRef.current = 'idle'
        setDemoState('idle')
    }

    const handleTranslate = (tx: number, ty: number) => {
        currentPointsRef.current = applyTranslation(currentPointsRef.current, tx, ty)
        updateShapeMesh(shapeMeshRef.current, currentPointsRef.current)
    }
    
    const handleDilate = (k: number) => {
        currentPointsRef.current = applyDilation(currentPointsRef.current, k)
        updateShapeMesh(shapeMeshRef.current, currentPointsRef.current)
    }

    const handleRotate = (t: number) => {
        currentPointsRef.current = applyRotation(currentPointsRef.current, t)
        updateShapeMesh(shapeMeshRef.current, currentPointsRef.current)
    }

    const handleReflect = (rfX: boolean, rfY: boolean) => {
        currentPointsRef.current = applyReflection(currentPointsRef.current, rfX, rfY)
        updateShapeMesh(shapeMeshRef.current, currentPointsRef.current)
    }

    const handleReset = () => {
        currentPointsRef.current = [...originalPointsRef.current]
        updateShapeMesh(shapeMeshRef.current, currentPointsRef.current)
    }

    const handleNewShape = () => {
        if (shapeMeshRef.current) {
            sceneRef.current.remove(shapeMeshRef.current)
            shapeMeshRef.current.geometry.dispose()
            shapeMeshRef.current = null
        }
        
        stateRef.current = 'idle'
        setDemoState('idle')
    }

    const labelFromState = () => {
        if (demoState === 'idle') return 'Add Shape'
        if (demoState === 'placing') return pointCount < 3 ? 'Select Points' : 'Confirm Shape'
        return ''
    }

    useEffect(() => {
        const mount = mountRef.current

        // --- renderer ---
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(mount.clientWidth, mount.clientHeight)
        mount.appendChild(renderer.domElement)

        // --- scene ---
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xffffff)
        sceneRef.current = scene
        
        // --- camera ---
        const aspect = mount.clientWidth / mount.clientHeight
        const frustumSize = 20
        const camera = new THREE.OrthographicCamera(
            (-frustumSize * aspect) / 2, // left
            (frustumSize * aspect) / 2, // right
            frustumSize / 2, // top
            -frustumSize / 2, // bottom
            0.1, // near
            1000 // far
        );
        camera.position.set(0, 0, 10)
        cameraRef.current = camera

        const handleResize = () => {
            const aspect = mount.clientWidth / mount.clientHeight
            camera.left = (-frustumSize * aspect) / 2
            camera.right = (frustumSize * aspect) / 2
            camera.top = frustumSize / 2
            camera.bottom = -frustumSize / 2
            camera.updateProjectionMatrix() // critical — always call this after changing camera params
            renderer.setSize(mount.clientWidth, mount.clientHeight)
        }
        window.addEventListener('resize', handleResize)

        // --- grid ---
        const gridStep = 1
        const majorGridStep = gridStep * 5
        const gridColor = 0x444444
        const majorGridColor = 0x000000

        const gridSizeX = Math.ceil((frustumSize * aspect) / 2 / majorGridStep) * majorGridStep
        const gridSizeY = Math.ceil((frustumSize) / 2 / majorGridStep) * majorGridStep

        const gridObjects = createGrid(scene, gridSizeX, gridSizeY, gridStep, gridColor)
        const majorGridObjects = createGrid(scene, gridSizeX, gridSizeY, majorGridStep, majorGridColor)

        // --- grid axes ---
        const axes = createAxes(sceneRef.current, gridSizeX, gridSizeY, 0xff0000, 0x0000ff)

        // --- display which point will be selected if user clicks ---
        let point: Point

        const previewDotGeometry = new THREE.CircleGeometry(0.1, 16)
        const previewDotMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 })
        const previewDot = new THREE.Mesh(previewDotGeometry, previewDotMaterial)
        previewDot.visible = false  // hidden until placing starts
        scene.add(previewDot)

        const handleMouseMove = (event: MouseEvent) => {
            if (stateRef.current != 'placing') {
                previewDot.visible = false
                return
            }

            point = getGridPoint(event, mount, camera)
            previewDot.position.set(point.x, point.y, 0.1)
            previewDot.visible = true
        }
        mount.addEventListener('mousemove', handleMouseMove)
        

        // --- handle canvas clicks for placing shape points ---
        const handleCanvasClick = (event: MouseEvent) => {
            if (stateRef.current === 'idle') return

            // add a small dot at the clicked point
            const dotGeometry = new THREE.CircleGeometry(0.1, 16)
            const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 })
            const dot = new THREE.Mesh(dotGeometry, dotMaterial)
            dot.position.set(point.x, point.y, 0.1) // slightly in front of grid
            scene.add(dot)
            previewDotsRef.current.push(dot)

            placedPointsRef.current.push(point)
            setPointCount(placedPointsRef.current.length)

            // update preview line connecting all placed points
            if (previewLineRef.current) {
                scene.remove(previewLineRef.current)
                previewLineRef.current.geometry.dispose()
            }

            if (placedPointsRef.current.length > 1) {
                const linePoints = placedPointsRef.current.map(
                    p => new THREE.Vector3(p.x, p.y, 0.1)
                )
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints)
                previewLineRef.current = new THREE.Line(
                    lineGeometry,
                    new THREE.LineBasicMaterial({ color: 0xff6600 })
                )
                scene.add(previewLineRef.current)
            }
        }
        mount.addEventListener('click', handleCanvasClick)

        // --- animation loop ---
        let animFrameID: number
        function animate() {
            animFrameID = requestAnimationFrame(animate)
            renderer.render(scene, camera)
        }
        animate()


        return () => {
            cancelAnimationFrame(animFrameID)
            window.removeEventListener('resize', handleResize)
            scene.remove(...gridObjects)
            gridObjects.forEach(g => g.geometry.dispose())
            scene.remove(...majorGridObjects)
            majorGridObjects.forEach(g => g.geometry.dispose())
            scene.remove(axes.xAxis)
            axes.xAxis.geometry.dispose()
            scene.remove(axes.yAxis)
            axes.yAxis.geometry.dispose()
            scene.remove(previewDot)
            mount.removeEventListener('click', handleCanvasClick)
            mount.removeEventListener('mousemove', handleMouseMove)
            mount.removeChild(renderer.domElement)
            renderer.dispose()
        };
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden items-center">
            <div ref={mountRef} className="w-full h-full"/>

            <div className="absolute top-2 left-3 space-x-2">
                {demoState != 'transforming' && <AddShape onClick={handleTogglePlacing} label={labelFromState()} />}
                {demoState == 'placing' && <CancelShape onClick={handleCancelPlacing} />}
                {demoState == 'transforming' && <TransformControls 
                    onTranslate={handleTranslate}
                    onDilate={handleDilate}
                    onRotate={handleRotate}
                    onReflect={handleReflect}
                    onReset={handleReset}
                    onNewShape={handleNewShape}
                />}
            </div>
        </div>
    )
}