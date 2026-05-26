'use client'
import Link from 'next/link'
import { useState } from 'react'
import SelectDemo from '../components/SelectDemo'

export default function Page() {
  const [demoPath, setDemoPath] = useState('/solar_demo');

  return (
    <div className="mt-4 max-w-sm mx-auto items-center rounded-lg bg-slate-200 p-4 space-y-2">
      <h1 className="text-3xl text-cyan-500 font-bold text-center">
        Three.js Demo
      </h1>
      <p className="text-center text-gray-700">
        Two simple demos using Three.js in a Next.js app.<br/>Created by Aydan Pronovost.
      </p>
      
      <div className="flex flex-col justify-center bg-gray-50 rounded-lg gap-y-2 items-center p-2">
        <SelectDemo onChange={setDemoPath}/>
        <Link href={demoPath} className="w-64 bg-cyan-500 px-4 py-3 text-white rounded-lg text-center">
          Begin Demo
        </Link>
      </div>
    </div>
  )
}