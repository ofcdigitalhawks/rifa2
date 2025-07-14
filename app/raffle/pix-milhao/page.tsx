"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown, ChevronRight } from "lucide-react"
import Image from "next/image"
import CheckoutPopup from "@/components/checkout-popup"

export default function PixMilhaoPage() {
  const [quantity, setQuantity] = useState(10)
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false)
  const [showCotasPremiadas, setShowCotasPremiadas] = useState(true)
  const [cotasTab, setCotasTab] = useState("todas")
  const [showMoreCotas, setShowMoreCotas] = useState(false)

  // Estado para contagem regressiva
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Scripts de tracking agora são carregados globalmente via TrackingScripts component

  // Efeito para contagem regressiva até as 20h de hoje
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const targetTime = new Date()

      // Definir a hora alvo para 20:00:00 do dia 16/06/2025
      targetTime.setFullYear(2025, 5, 16) // Month is 0-indexed, so 5 = June
      targetTime.setHours(20, 0, 0, 0)

      // Se já passou das 20h, não mostra contagem regressiva
      if (now >= targetTime) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 })
        return
      }

      // Calcular diferença em milissegundos
      const diff = targetTime.getTime() - now.getTime()

      // Converter para horas, minutos e segundos
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({ hours, minutes, seconds })
    }

    // Calcular imediatamente e depois a cada segundo
    calculateTimeRemaining()
    const timer = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 10) {
      setQuantity(newQuantity)
    }
  }

  const totalPrice = quantity === 10 ? 19.99 : (quantity * 1.99).toFixed(2)

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="bg-[#1e1e1e] p-4">
        <div className="max-w-[540px] mx-auto flex justify-between items-center">
          <div className="h-6 flex items-center">
            <Image src="/images/logo.png" alt="PIX DO MILHÃO" width={120} height={24} className="object-contain" />
          </div>
          <button className="flex items-center text-gray-300 border border-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-700 text-sm">
            <Search className="w-4 h-4 mr-1.5" />
            Minhas compras
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[540px] mx-auto">
        {/* Main Banner */}
        <div className="mb-0">
          <Image
            src="/images/banner-pix-milhao-atualizado.webp"
            alt="PIX DO MILHÃO - CONCORRA R$1.000.000"
            width={540}
            height={270}
            className="w-full"
          />
        </div>

        {/* Prize Schedule */}
        <div className="bg-[#1e1e1e] p-4">
          <div className="space-y-2 mb-2">
            <div className="flex items-center">
              <span className="text-white text-sm">🍀 1° Cem Mil Reais - 16/06/2025 20:00</span>
            </div>
            <div className="flex items-center">
              <span className="text-white text-sm">🍀 2° Cem Mil Reais - 18/06/2025 20:00</span>
            </div>
            <div className="flex items-center">
              <span className="text-white text-sm">🍀 Um Milhão de Reais - 20/06/2025 20:00</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-white text-sm">Por apenas </span>
            <span className="text-[#FFC107] font-bold text-sm">R$ 1,99</span>
            <span className="text-white text-sm"> no combo!</span>
          </div>
        </div>

        {/* Countdown - Real-time countdown to 16/06/2025 20:00 */}
        <div className="bg-[#1e1e1e] p-4 text-center">
          {timeRemaining.hours > 0 || timeRemaining.minutes > 0 || timeRemaining.seconds > 0 ? (
            <div className="text-white text-sm mb-2">
              Faltam{" "}
              <span className="bg-[#FFC107] text-black px-2 py-1 rounded font-bold text-lg animate-pulse mx-1">
                {timeRemaining.hours.toString().padStart(2, "0")}
              </span>
              <span className="text-white text-xs">h</span>
              <span className="bg-[#FFC107] text-black px-2 py-1 rounded font-bold text-lg animate-pulse mx-1">
                {timeRemaining.minutes.toString().padStart(2, "0")}
              </span>
              <span className="text-white text-xs">m</span>
              <span className="bg-[#FFC107] text-black px-2 py-1 rounded font-bold text-lg animate-pulse mx-1">
                {timeRemaining.seconds.toString().padStart(2, "0")}
              </span>
              <span className="text-white text-xs">s</span>
            </div>
          ) : (
            <div className="text-white text-sm mb-2">
              <span className="text-[#FFC107] font-bold">SORTEIO EM ANDAMENTO!</span>
            </div>
          )}
          <div className="text-sm">
            para o sorteio de <span className="text-[#FFC107] font-bold">1° Cem Mil Reais</span> !
          </div>
        </div>

        {/* Bonus Info */}
        <div className="bg-[#262626] p-3 text-sm">
          <p className="text-center">
            A cada 10 Ebooks/Números, ganhe <span className="text-[#FFC107]">10 chances no sorteio</span> +{" "}
            <span className="text-[#4CAF50]">5 Giros da Sorte</span>
          </p>
        </div>

        {/* Promotion Section */}
        <div className="bg-[#1e1e1e] p-4">
          <div className="flex items-center mb-3">
            <div className="w-5 h-5 bg-[#FF5722] rounded-full flex items-center justify-center mr-2 text-xs">🔥</div>
            <span className="text-[#FF5722] font-medium">Promoção</span>
          </div>
          <div className="flex items-center justify-between bg-[#262626] rounded p-3">
            <div>
              <div className="bg-[#FF5722] text-white px-2 py-0.5 rounded text-xs inline-block mb-1">60% OFF</div>
              <div className="text-white text-sm">+10 Ebooks/Números</div>
            </div>
            <div className="text-right">
              <div className="text-white text-sm">De R$ 49,90 por</div>
              <div className="text-[#4CAF50] font-bold">R$ 19,99</div>
            </div>
          </div>
        </div>

        {/* Quantity Selection */}
        <div className="bg-[#1e1e1e] p-4">
          <div className="text-white text-sm mb-6">Escolha de Ebooks/Números</div>

          <div className="grid grid-cols-4 gap-2 mb-4 relative">
            <button
              onClick={() => handleQuantityChange(quantity + 5)}
              className="border border-[#444444] text-white py-2 px-0 rounded text-sm"
            >
              +5
            </button>
            <div className="relative">
              <div className="flex items-center justify-center mb-1 absolute -top-5 left-0 right-0">
                <div className="w-2 h-2 bg-[#FF0000] rounded-full mr-1"></div>
                <span className="text-[#FF0000] text-xs">Mais popular</span>
              </div>
              <button
                onClick={() => handleQuantityChange(quantity + 10)}
                className="bg-[#FFC107] text-black py-2 px-0 rounded font-medium text-sm w-full"
              >
                +10
              </button>
            </div>
            <button
              onClick={() => handleQuantityChange(quantity + 20)}
              className="border border-[#444444] text-white py-2 px-0 rounded text-sm"
            >
              +20
            </button>
            <button
              onClick={() => handleQuantityChange(quantity + 50)}
              className="border border-[#444444] text-white py-2 px-0 rounded text-sm"
            >
              +50
            </button>
          </div>

          <div className="flex items-center mb-4">
            <button
              onClick={() => quantity > 10 && handleQuantityChange(quantity - 1)}
              className="border border-[#444444] text-white w-10 h-10 rounded-l flex items-center justify-center"
            >
              -
            </button>
            <input
              type="number"
              min="10"
              value={quantity}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value) || 10
                if (value >= 10) {
                  handleQuantityChange(value)
                }
              }}
              className="border-t border-b border-[#444444] bg-transparent text-white h-10 flex-1 text-center outline-none"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="border border-[#444444] text-white w-10 h-10 rounded-r flex items-center justify-center"
            >
              +
            </button>
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="text-white text-sm">{quantity} Ebooks/Números</span>
            <span className="text-[#4CAF50] font-bold">R$ {totalPrice}</span>
          </div>

          <button
            onClick={() => setShowCheckoutPopup(true)}
            className="w-full bg-[#8BC34A] hover:bg-[#7CB342] text-white py-2 rounded text-sm font-medium"
          >
            Ir para pagamento
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#333333] my-4 mx-4"></div>

        {/* Giro da Sorte */}
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-[#FFC107] rounded-full flex items-center justify-center mr-2 text-xs">🎯</div>
            <span className="text-white font-medium">Giro da sorte</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center bg-[#262626] rounded p-3">
              <div>
                <div className="text-white text-sm">A cada 10 números</div>
                <div className="text-gray-400 text-xs">5 Chances de contemplação na roleta</div>
              </div>
              <div className="flex items-center">
                <span className="text-[#FFC107] font-medium mr-1 text-sm">Recebe 5</span>
                <div className="w-5 h-5 bg-[#FFC107] rounded-full flex items-center justify-center text-xs">🪙</div>
                <span className="text-[#FFC107] font-medium ml-1 text-sm">Giros</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#262626] rounded p-3">
              <div>
                <div className="text-white text-sm">A cada 20 números</div>
                <div className="text-gray-400 text-xs">10 Chances de contemplação na roleta</div>
              </div>
              <div className="flex items-center">
                <span className="text-[#FFC107] font-medium mr-1 text-sm">Recebe 10</span>
                <div className="w-5 h-5 bg-[#FFC107] rounded-full flex items-center justify-center text-xs">🪙</div>
                <span className="text-[#FFC107] font-medium ml-1 text-sm">Giros</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#262626] rounded p-3">
              <div>
                <div className="text-white text-sm">A cada 30 números</div>
                <div className="text-gray-400 text-xs">15 Chances de contemplação na roleta</div>
              </div>
              <div className="flex items-center">
                <span className="text-[#FFC107] font-medium mr-1 text-sm">Recebe 15</span>
                <div className="w-5 h-5 bg-[#FFC107] rounded-full flex items-center justify-center text-xs">🪙</div>
                <span className="text-[#FFC107] font-medium ml-1 text-sm">Giros</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cotas Premiadas - Expandable */}
        <div className="bg-[#1e1e1e] mx-4 rounded p-4 mb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setShowCotasPremiadas(!showCotasPremiadas)}
          >
            <div className="flex items-center">
              <span className="text-[#4CAF50] mr-2">🍀</span>
              <span className="text-white text-sm font-medium">Cotas Premiadas</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="border border-yellow-500 text-yellow-400 px-3 py-1 rounded text-xs hover:bg-yellow-500 hover:text-black transition-colors">
                🏆 Ver ganhadores
              </button>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${showCotasPremiadas ? "rotate-180" : ""}`}
              />
            </div>
          </div>

          {showCotasPremiadas && (
            <div className="mt-4 space-y-4">
              {/* Counter */}
              <div className="text-white text-sm">970 disponíveis/1000 cotas</div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setCotasTab("todas")}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                    cotasTab === "todas" ? "bg-yellow-500 text-black" : "bg-gray-700 text-white border border-gray-600"
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setCotasTab("disponiveis")}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                    cotasTab === "disponiveis"
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-700 text-white border border-gray-600"
                  }`}
                >
                  Disponíveis
                </button>
                <button
                  onClick={() => setCotasTab("compradas")}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                    cotasTab === "compradas"
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-700 text-white border border-gray-600"
                  }`}
                >
                  Compradas
                </button>
              </div>

              {/* Prize List */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {cotasTab === "todas" && (
                  <>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 50.000,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1735006
                        </div>
                      </div>
                      <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 10.000,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1734085
                        </div>
                      </div>
                      <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 10.000,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1734392
                        </div>
                      </div>
                      <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 5.000,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1732857
                        </div>
                      </div>
                      <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                    </div>

                    {showMoreCotas && (
                      <>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <div>
                            <div className="text-white font-bold">R$ 5.000,00</div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-1">🎫</span>
                              1733124
                            </div>
                          </div>
                          <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <div>
                            <div className="text-white font-bold">R$ 2.000,00</div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-1">🎫</span>
                              1733567
                            </div>
                          </div>
                          <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <div>
                            <div className="text-white font-bold">R$ 2.000,00</div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-1">🎫</span>
                              1733891
                            </div>
                          </div>
                          <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <div>
                            <div className="text-white font-bold">R$ 1.000,00</div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-1">🎫</span>
                              1734256
                            </div>
                          </div>
                          <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <div>
                            <div className="text-white font-bold">R$ 1.000,00</div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-1">🎫</span>
                              1734623
                            </div>
                          </div>
                          <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                        </div>
                      </>
                    )}
                  </>
                )}

                {cotasTab === "disponiveis" && (
                  <>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 1.000,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1724875
                        </div>
                      </div>
                      <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 1.000,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1725182
                        </div>
                      </div>
                      <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 1.000,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1725489
                        </div>
                      </div>
                      <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 1.000,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1726103
                        </div>
                      </div>
                      <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                    </div>

                    {showMoreCotas && (
                      <>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <div>
                            <div className="text-white font-bold">R$ 1.000,00</div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-1">🎫</span>
                              1726410
                            </div>
                          </div>
                          <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <div>
                            <div className="text-white font-bold">R$ 1.000,00</div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-1">🎫</span>
                              1726717
                            </div>
                          </div>
                          <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <div>
                            <div className="text-white font-bold">R$ 1.000,00</div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-1">🎫</span>
                              1727024
                            </div>
                          </div>
                          <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <div>
                            <div className="text-white font-bold">R$ 1.000,00</div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-1">🎫</span>
                              1727331
                            </div>
                          </div>
                          <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">Disponível</span>
                        </div>
                      </>
                    )}
                  </>
                )}

                {cotasTab === "compradas" && (
                  <>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 1.000,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1730708
                        </div>
                        <div className="text-gray-500 text-xs">13/06/2025 20:38</div>
                      </div>
                      <div className="text-right">
                        <span className="bg-gray-500 text-white px-3 py-1 rounded text-sm block mb-1">Comprado</span>
                        <span className="text-gray-400 text-xs">Carlos c*********</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 500,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1714437
                        </div>
                        <div className="text-gray-500 text-xs">13/06/2025 22:36</div>
                      </div>
                      <div className="text-right">
                        <span className="bg-gray-500 text-white px-3 py-1 rounded text-sm block mb-1">Comprado</span>
                        <span className="text-gray-400 text-xs">Keliane B****</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 500,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1715051
                        </div>
                        <div className="text-gray-500 text-xs">13/06/2025 20:04</div>
                      </div>
                      <div className="text-right">
                        <span className="bg-gray-500 text-white px-3 py-1 rounded text-sm block mb-1">Comprado</span>
                        <span className="text-gray-400 text-xs">Camila B******</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 100,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1607908
                        </div>
                        <div className="text-gray-500 text-xs">13/06/2025 22:04</div>
                      </div>
                      <div className="text-right">
                        <span className="bg-gray-500 text-white px-3 py-1 rounded text-sm block mb-1">Comprado</span>
                        <span className="text-gray-400 text-xs">Giselle F********</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-bold">R$ 100,00</div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-1">🎫</span>
                          1609443
                        </div>
                        <div className="text-gray-500 text-xs">13/06/2025 20:39</div>
                      </div>
                      <div className="text-right">
                        <span className="bg-gray-500 text-white px-3 py-1 rounded text-sm block mb-1">Comprado</span>
                        <span className="text-gray-400 text-xs">José s**********</span>
                      </div>
                    </div>

                    {showMoreCotas && (
                      <>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <div>
                            <div className="text-white font-bold">R$ 1.000,00</div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-1">🎫</span>
                              1728456
                            </div>
                            <div className="text-gray-500 text-xs">14/06/2025 15:22</div>
                          </div>
                          <div className="text-right">
                            <span className="bg-yellow-500 text-black px-3 py-1 rounded text-sm block mb-1">
                              Contemplado
                            </span>
                            <span className="text-yellow-400 text-xs">Maria S*********</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <div>
                            <div className="text-white font-bold">R$ 1.000,00</div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-1">🎫</span>
                              1729123
                            </div>
                            <div className="text-gray-500 text-xs">14/06/2025 18:45</div>
                          </div>
                          <div className="text-right">
                            <span className="bg-yellow-500 text-black px-3 py-1 rounded text-sm block mb-1">
                              Contemplado
                            </span>
                            <span className="text-yellow-400 text-xs">João P*********</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <div>
                            <div className="text-white font-bold">R$ 1.000,00</div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-1">🎫</span>
                              1729887
                            </div>
                            <div className="text-gray-500 text-xs">14/06/2025 21:12</div>
                          </div>
                          <div className="text-right">
                            <span className="bg-yellow-500 text-black px-3 py-1 rounded text-sm block mb-1">
                              Contemplado
                            </span>
                            <span className="text-yellow-400 text-xs">Ana C**********</span>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Ver mais cotas button */}
              <div className="text-center pt-3 border-t border-gray-700">
                <button
                  onClick={() => setShowMoreCotas(!showMoreCotas)}
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  {showMoreCotas ? "- Ver menos cotas" : "+ Ver mais cotas"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Car Promotion */}
        <div className="mx-4 mb-4">
          <button className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white py-3 rounded-lg flex items-center justify-between px-4 text-sm">
            <div className="flex items-center">
              <span className="mr-2">🚗</span>
              <span>Quer um carro 0km de graça?</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Partner Logos */}
        <div className="flex justify-center space-x-8 my-6">
          <div className="text-center">
            <div className="h-6">
              <span className="text-white text-xs">ApliCap</span>
            </div>
          </div>
          <div className="text-center">
            <div className="h-6 flex items-center justify-center">
              <Image src="/images/logo.png" alt="PIX DO MILHÃO" width={100} height={20} className="object-contain" />
            </div>
          </div>
        </div>

        {/* Action Links */}
        <div className="space-y-2 mb-6 px-4">
          <div className="text-center">
            <span className="text-[#FFC107]">⭐ </span>
            <a href="#" className="text-[#2196F3] text-xs">
              CLIQUE E VEJA TODAS AS ENTREGAS DOS PRÊMIOS DE R$ 1.000.000,00 DE TODAS AS EDIÇÕES
            </a>
            <span className="text-[#FFC107]"> ⭐</span>
          </div>

          <div className="text-center">
            <span className="text-[#FFC107]">🎯 </span>
            <a href="#" className="text-[#2196F3] text-xs">
              GRUPO VIP PARTICIPE
            </a>
            <span className="text-white text-xs">
              {" "}
              (Concorra a um CARRO ZERO KM GRÁTIS, apenas para participantes da comunidade)
            </span>
          </div>

          <div className="text-center">
            <span className="text-[#FFC107]">📱 </span>
            <a href="#" className="text-[#2196F3] text-xs">
              CANAL INSTAGRAM PARTICIPE
            </a>
          </div>

          <div className="text-center">
            <a href="#" className="text-[#2196F3] text-xs">
              VEJA QUEM GANHOU R$ 1.000.000,00 NA AÇÃO DO DIA 06/06/2025, CLIQUE AQUI
            </a>
            <span className="text-[#FFC107]"> 👈</span>
          </div>

          <div className="text-center">
            <a href="#" className="text-[#2196F3] text-xs">
              ASSISTA A LIVE DO SORTEIO DE R$ 1.000.000,00 NA AÇÃO DO DIA 06/06/2025, CLIQUE AQUI
            </a>
            <span className="text-[#FFC107]"> 👈</span>
          </div>
        </div>

        {/* Legal Text */}
        <div className="px-4 mb-6">
          <div className="text-gray-400 text-xs leading-relaxed space-y-2">
            <p>
              <span className="text-[#FFC107]">🏆 R$ 1 MILHÃO DE REAIS PARA MUDAR DE VIDA!</span>
            </p>
            <p>
              <span className="text-[#FFC107]">
                📚 ACESSO GRATUITO, VITALÍCIO E NA QUINTA, AOS 17 EBOOKS PREMIADOS SORTUDOS NO APLICATIVO NO VALOR DE R$
                749,99 CADA!
              </span>
            </p>
            <p>
              Ao fazer sua compra, você receberá um e-mail com o link para download dos ebooks. Você também receberá um
              número da sorte para concorrer aos prêmios.
            </p>
            <p>
              Pix do MILHÃO responde exclusivamente: Escolha o seu conteúdo favorito, tenha acesso das mais variadas
              temáticas e diferentes tipos de conteúdo.
            </p>
            <p>O sorteio será sexta dia 13/06/2024, às 20:00 horas, ao vivo, em nossas redes sociais.</p>
            <p>
              Instagram:{" "}
              <a href="#" className="text-[#2196F3]">
                @pixdomilhao
              </a>{" "}
              &{" "}
              <a href="#" className="text-[#2196F3]">
                @aplicap
              </a>
            </p>
            <p>
              Youtube:{" "}
              <a href="#" className="text-[#2196F3]">
                PIX DO MILHÃO
              </a>
            </p>
            <p>
              <span className="text-[#FFC107]">SUPORTE PIX DO MILHÃO 24H: </span>
              <a href="#" className="text-[#2196F3]">
                CLIQUE AQUI
              </a>
              <span className="text-[#FFC107]"> 👈</span>
            </p>
          </div>
        </div>

        {/* Regulation */}
        <div className="px-4 mb-6">
          <div className="text-gray-400 text-xs leading-relaxed">
            <p className="mb-2">
              Processo SUSEP nº 15414.634605/2025-31, 15414.634606/2025-86, 15414.634607/2025-31 Sorteios realizados em
              Títulos de Capitalização da modalidade incentivo emitidos pela Aplicap Capitalização S/A, CNPJ
              13.172.881/0001-71, é vedada participação por menores de 16 (dezesseis) anos conforme legislação
              aplicável.
            </p>
            <p className="mb-2">
              Telefone de Atendimento: 51 3094-1762 ou 0800 606 6940. Os prêmios estão sujeitos incidência de Imposto de
              Renda conforme legislação vigente. Consulte o regulamento completo e condições gerais em nosso site.
              Consulte as condições gerais e regulamento.
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#" className="text-[#2196F3]">
                Condições gerais
              </a>
              <a href="#" className="text-[#2196F3]">
                Regulamento
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs pb-4">v0.1.99-ctd10</div>
      </div>
      <CheckoutPopup
        isOpen={showCheckoutPopup}
        onClose={() => setShowCheckoutPopup(false)}
        quantity={quantity}
        totalPrice={totalPrice.toString()}
      />
    </div>
  )
}
