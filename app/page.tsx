import Link from 'next/link'

export default function Page() {

  return (
    <div className="mt-4 max-w-sm mx-auto items-center rounded-lg bg-slate-200 p-4 space-y-2">
      <h1 className="text-3xl text-cyan-500 font-bold text-center">
        Three.js Demo
      </h1>
      <p className="text-center text-gray-700">
        A simple demo of Three.js in a Next.js app.<br/>Created by Aydan Pronovost.
      </p>
      <div className="flex justify-center">
        <Link href="/demo" className="w-64 bg-cyan-500 px-4 py-3 text-white rounded-lg text-center">
          Begin Demo
        </Link>
      </div>
    </div>
  )
}