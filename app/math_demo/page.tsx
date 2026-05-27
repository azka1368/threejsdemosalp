'use client'
import AddShape from '../../components/math_demo/AddShape'
import CancelShape from '../../components/math_demo/CancelShape'
import TransformControls from '../../components/math_demo/TransformControls'
import { useMathDemo } from '../../hooks/math_demo/useMathDemo'

export default function page() {
    const {
        demoState,
        pointCount,
        handleTogglePlacing,
        handleCancelPlacing,
        handleTranslate,
        handleDilate,
        handleRotate,
        handleReflect,
        handleReset,
        handleNewShape,
        mountRef
    } = useMathDemo()

    
    const labelFromState = () => {
        if (demoState === 'idle') return 'Add Shape'
        if (demoState === 'placing') return pointCount < 3 ? 'Select Points' : 'Confirm Shape'
        return ''
    }

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