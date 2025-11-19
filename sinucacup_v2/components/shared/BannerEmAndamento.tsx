export default function BannerEmAndamento() {
  return (
    <div className="bg-laranja-aviso bg-opacity-20 border-2 border-laranja-aviso p-4 rounded-lg mb-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎯</span>
        <div>
          <p className="font-bold text-lg">Campeonato em Andamento</p>
          <p className="text-sm opacity-90">
            Duplas e chaveamento estao travados. Registre os resultados das partidas abaixo.
          </p>
        </div>
      </div>
    </div>
  )
}

