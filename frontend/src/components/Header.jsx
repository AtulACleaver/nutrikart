export default function Header() {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
                <span className="text-2xl">🥬</span>
                <h1 className="text-xl font-bold text-gray-900">NutriKart</h1>
                <span className="text-sm text-gray-400 hidden sm:inline">
                    Smart grocery recommendations
                </span>
            </div>
        </header>
    )
}