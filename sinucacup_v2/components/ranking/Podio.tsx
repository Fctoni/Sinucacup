import { Jogador } from '@/types'
import Image from 'next/image'

type Props = {
  top3: Jogador[]
}

export default function Podio({ top3 }: Props) {
  const [primeiro, segundo, terceiro] = top3
  
  if (!primeiro) return null
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* 2º Lugar */}
      {segundo && (
        <div className="order-2 md:order-1 flex flex-col items-center">
          <div className="bg-gradient-to-br from-prata to-gray-400 p-6 rounded-xl w-full text-center border-4 border-prata shadow-card">
            <div className="text-6xl mb-3">🥈</div>
            
            {segundo.foto_url ? (
              <Image
                src={segundo.foto_url}
                alt={segundo.nome}
                width={80}
                height={80}
                className="rounded-full mx-auto mb-3 border-4 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-3 text-4xl">
                👤
              </div>
            )}
            
            <h3 className="text-2xl font-bold text-cinza-escuro mb-1">{segundo.nome}</h3>
            <p className="text-sm text-cinza-escuro opacity-70 mb-3">{segundo.setor}</p>
            
            <div className="bg-white bg-opacity-90 rounded-lg p-3">
              <p className="text-4xl font-bold text-prata">{segundo.pontos_totais}</p>
              <p className="text-sm text-cinza-escuro">pontos</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-white bg-opacity-70 rounded p-2">
                <p className="text-xs text-cinza-escuro">Vitorias</p>
                <p className="font-bold text-cinza-escuro">{segundo.vitorias}</p>
              </div>
              <div className="bg-white bg-opacity-70 rounded p-2">
                <p className="text-xs text-cinza-escuro">Jogos</p>
                <p className="font-bold text-cinza-escuro">{segundo.participacoes}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 1º Lugar */}
      <div className="order-1 md:order-2 flex flex-col items-center">
        <div className="bg-gradient-to-br from-ouro via-yellow-400 to-ouro p-8 rounded-xl w-full text-center border-4 border-ouro shadow-card-hover relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-ouro to-yellow-600 opacity-20 animate-pulse" />
          
          <div className="relative z-10">
            <div className="text-7xl mb-3 animate-bounce">🥇</div>
            
            {primeiro.foto_url ? (
              <Image
                src={primeiro.foto_url}
                alt={primeiro.nome}
                width={100}
                height={100}
                className="rounded-full mx-auto mb-4 border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-4 text-5xl">
                👤
              </div>
            )}
            
            <h3 className="text-3xl font-bold text-cinza-escuro mb-1">{primeiro.nome}</h3>
            <p className="text-sm text-cinza-escuro opacity-70 mb-4">{primeiro.setor}</p>
            
            <div className="bg-white bg-opacity-90 rounded-lg p-4">
              <p className="text-5xl font-bold text-ouro">{primeiro.pontos_totais}</p>
              <p className="text-sm text-cinza-escuro">pontos</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-white bg-opacity-80 rounded p-3">
                <p className="text-xs text-cinza-escuro">Vitorias</p>
                <p className="text-xl font-bold text-cinza-escuro">{primeiro.vitorias}</p>
              </div>
              <div className="bg-white bg-opacity-80 rounded p-3">
                <p className="text-xs text-cinza-escuro">Jogos</p>
                <p className="text-xl font-bold text-cinza-escuro">{primeiro.participacoes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 3º Lugar */}
      {terceiro && (
        <div className="order-3 flex flex-col items-center">
          <div className="bg-gradient-to-br from-bronze to-amber-700 p-6 rounded-xl w-full text-center border-4 border-bronze shadow-card">
            <div className="text-6xl mb-3">🥉</div>
            
            {terceiro.foto_url ? (
              <Image
                src={terceiro.foto_url}
                alt={terceiro.nome}
                width={80}
                height={80}
                className="rounded-full mx-auto mb-3 border-4 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-3 text-4xl">
                👤
              </div>
            )}
            
            <h3 className="text-2xl font-bold text-white mb-1">{terceiro.nome}</h3>
            <p className="text-sm text-white opacity-70 mb-3">{terceiro.setor}</p>
            
            <div className="bg-white bg-opacity-90 rounded-lg p-3">
              <p className="text-4xl font-bold text-bronze">{terceiro.pontos_totais}</p>
              <p className="text-sm text-cinza-escuro">pontos</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-white bg-opacity-70 rounded p-2">
                <p className="text-xs text-cinza-escuro">Vitorias</p>
                <p className="font-bold text-cinza-escuro">{terceiro.vitorias}</p>
              </div>
              <div className="bg-white bg-opacity-70 rounded p-2">
                <p className="text-xs text-cinza-escuro">Jogos</p>
                <p className="font-bold text-cinza-escuro">{terceiro.participacoes}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

