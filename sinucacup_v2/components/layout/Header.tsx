export default function Header() {
  return (
    <header className="bg-cinza-medio shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎱</span>
            <div>
              <h1 className="text-3xl font-bold">TecnoHard Sinuca Cup</h1>
              <p className="text-texto-secundario text-sm">Sistema de Gerenciamento de Torneios</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

