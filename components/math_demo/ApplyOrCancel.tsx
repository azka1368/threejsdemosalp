interface ApplyOrCancelProps {
    onClickApply: () => void,
    onClickCancel: () => void
}

export default function ApplyOrCancel({ onClickApply, onClickCancel }: ApplyOrCancelProps) {
    return (
        <div>
            <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                onClick={onClickApply}>
                Apply
            </button>
            <button
                className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded text-sm"
                onClick={onClickCancel}>
                Cancel
            </button>
        </div>
    )
}