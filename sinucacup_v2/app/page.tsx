export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-5xl mb-4">🎱 TecnoHard Sinuca Cup</h1>
        <p className="text-texto-secundario text-xl">
          Sistema completo de gerenciamento de torneios trimestrais de sinuca
        </p>
      </section>
      
      <section className="grid md:grid-cols-2 gap-6">
        <div className="card-base">
          <h3 className="text-2xl mb-4">🚀 Acoes Rapidas</h3>
          <div className="space-y-4">
            <button className="btn-primary w-full">
              ➕ Nova Edicao do Campeonato
            </button>
            <button className="btn-secondary w-full">
              👥 Cadastrar Jogador
            </button>
          </div>
        </div>
        
        <div className="card-base">
          <h3 className="text-2xl mb-4">ℹ️ Como Funciona</h3>
          <ul className="space-y-3 text-texto-secundario">
            <li>✅ Torneios trimestrais em duplas</li>
            <li>✅ Formacao automatica de duplas balanceadas</li>
            <li>✅ Chaveamento com sistema de BYE</li>
            <li>✅ Ranking acumulativo anual</li>
            <li>✅ Distribuicao automatica de pontos</li>
          </ul>
        </div>
      </section>
      
      <section className="card-base">
        <h3 className="text-2xl mb-4">🏆 Sistema de Pontuacao</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-cinza-medio rounded-lg">
            <div className="text-4xl mb-2">🥇</div>
            <h4 className="text-xl font-bold text-ouro mb-2">Campeao</h4>
            <p className="text-3xl font-bold">+10 pontos</p>
          </div>
          <div className="p-6 bg-cinza-medio rounded-lg">
            <div className="text-4xl mb-2">🥈</div>
            <h4 className="text-xl font-bold text-prata mb-2">Vice-Campeao</h4>
            <p className="text-3xl font-bold">+6 pontos</p>
          </div>
          <div className="p-6 bg-cinza-medio rounded-lg">
            <div className="text-4xl mb-2">📊</div>
            <h4 className="text-xl font-bold text-verde-claro mb-2">Participante</h4>
            <p className="text-3xl font-bold">+2 pontos</p>
          </div>
        </div>
      </section>
    </div>
  )
}
