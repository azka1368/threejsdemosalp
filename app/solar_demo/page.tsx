'use client'
import { useSolarDemo } from '../../hooks/solar_demo/useSolarDemo'

export default function Page() {
    
    const {
        mountRef,
        animateRef,
        animationRef,
        clockRef
    } = useSolarDemo()

    return (
        <div className="relative w-screen h-screen overflow-hidden items-center">
            {/*Three.js canvas*/}
            <div ref={mountRef} className="w-full h-full"/>

            {/*control elements*/}
            <div className="absolute top-4 left-4 flex flex-row gap-2">
                <button onClick={() => {
                    clockRef.current.getDelta(); // resets the time since last call so planets don't jump to a new spot
                    animateRef.current();
                }} 
                className="bg-white text-black px-4 py-2 rounded">
                    Start
                </button>
                <button onClick={() => {
                    cancelAnimationFrame(animationRef.current)
                }} 
                className="bg-white text-black px-4 py-2 rounded">
                    Stop
                </button>
            </div>
        </div>
    )
}