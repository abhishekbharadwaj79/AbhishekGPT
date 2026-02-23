export function Header() {
  return (
    <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl font-bold">
          S
        </div>
        <div>
          <h1 className="text-xl font-bold text-blue-400">SportsGPT</h1>
          <p className="text-xs text-gray-400">Your AI Sports Assistant</p>
        </div>
      </div>
    </header>
  );
}
