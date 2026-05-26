'use client'
interface selectDemoProps {
    onChange: (value: string) => void;
}

export default function SelectDemo({ onChange }: selectDemoProps) {

    return (
        <div className="bg-gray-300 p-2 rounded-md">
          <label>Select a Demo: </label>
          <select onChange={(e) => onChange(e.target.value)}>
            <option value='/solar_demo'>Solar System Demo</option>
            <option value='/math_demo'>Math Demo</option>
          </select>
        </div>
    )
}