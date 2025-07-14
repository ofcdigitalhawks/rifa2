import { type NextRequest, NextResponse } from "next/server"
import { NivopayService, type NivopayPaymentResponse } from "@/lib/nivopay"
import { generateCustomerData } from "@/lib/fake-data"
import { Database } from "@/lib/database"
import { XtrackyService } from "@/lib/xtracky"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nome,
      telefone,
      amount,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      click_id,
      CampaignID,
      CreativeID,
      product_hash,
      offer_hash,
    } = body

    // Debug logs
    console.log("🔍 Dados recebidos na API:")
    console.log("Nome recebido:", nome)
    console.log("Product hash recebido:", product_hash)
    console.log("Offer hash recebido:", offer_hash)

    console.log("Received UTM data in API:", {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      click_id,
      CampaignID,
      CreativeID,
    })

    // Verifica valor mínimo
    if (amount < 500) {
      return NextResponse.json({
        erro: true,
        mensagem: "O valor mínimo permitido é R$ 5,00",
      })
    }

    // Gerar dados complementares do cliente (usando 4Devs + fallback local)
    const fakeData = await generateCustomerData(true)
    
    // Combinar dados reais com dados gerados
    const customer = {
      name: nome || fakeData.name,
      email: fakeData.email,
      cpf: fakeData.cpf,
      phone: telefone?.replace(/\D/g, '') || fakeData.phone
    }

    // Construir UTM query string
    const utmParams = new URLSearchParams()
    if (utm_source) utmParams.append('utm_source', utm_source)
    if (utm_medium) utmParams.append('utm_medium', utm_medium)
    if (utm_campaign) utmParams.append('utm_campaign', utm_campaign)
    if (utm_term) utmParams.append('utm_term', utm_term)
    if (utm_content) utmParams.append('utm_content', utm_content)
    if (click_id) utmParams.append('click_id', click_id)
    if (CampaignID) utmParams.append('CampaignID', CampaignID)
    if (CreativeID) utmParams.append('CreativeID', CreativeID)

    const utmQuery = utmParams.toString()
    const checkoutUrl = `https://${request.headers.get('host')}${request.nextUrl.pathname}`
    const referrerUrl = request.headers.get('referer') || ''

    console.log("📦 Dados do cliente processados:")
    console.log("- Nome:", customer.name)
    console.log("- Email:", customer.email)
    console.log("- CPF:", customer.cpf)
    console.log("- Telefone:", customer.phone)
    console.log("- Valor:", amount)

    console.log("🔄 Criando pagamento via Nivopay...")

    // Criar pagamento via Nivopay
    const paymentResult = await NivopayService.createPayment(
      amount,
      customer,
      'PIX DO MILHAO',
      utmQuery,
      checkoutUrl,
      referrerUrl
    )

    // Verificar se houve erro na criação
    if ('error' in paymentResult && paymentResult.error) {
      console.error("❌ Erro na geração do PIX:", paymentResult.message)
      return NextResponse.json({
        error: true,
        message: paymentResult.message || "Erro ao gerar o PIX",
        details: paymentResult.details
      })
    }

    const payment = paymentResult as any // Type assertion para evitar erro

    console.log("✅ PIX gerado com sucesso:", payment.id)

    // Salvar no banco interno
    try {
      await Database.insert({
        payment_id: payment.id,
        status: 'PENDING',
        amount: amount,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_cpf: customer.cpf,
        customer_phone: customer.phone,
        pix_code: payment.pixCode,
        utm_source: utm_source || '',
        action: 'GENERATED'
      })
      console.log("💾 Pagamento salvo no banco interno")
    } catch (dbError) {
      console.warn("⚠️ Erro ao salvar no banco:", dbError)
      // Não falhar a requisição por erro no banco
    }

    // Enviar evento para Xtracky (PIX gerado = waiting_payment)
    try {
      const utmSourceForXtracky = utm_source && utm_source.trim() !== '' ? utm_source : undefined
      console.log("🔔 UTM Source para Xtracky:", utmSourceForXtracky)
      
      await XtrackyService.sendWaitingPayment(payment.id, amount, utmSourceForXtracky)
      console.log("🔔 Evento 'waiting_payment' enviado para Xtracky")
    } catch (xtrackyError) {
      console.warn("⚠️ Erro ao enviar evento para Xtracky:", xtrackyError)
      // Não falhar a requisição por erro na Xtracky
    }

    // Retornar dados formatados para o frontend (mantendo compatibilidade)
    return NextResponse.json({
      error: false,
      pix_code: payment.pixCode,
      pix_qr_code: payment.pixCode,
      qr_code: payment.pixCode,
      transaction_id: payment.id,
      hash: payment.id,
      amount: payment.amount || amount,
      pix: {
        pix_qr_code: payment.pixCode,
        pix_code: payment.pixCode,
        transaction_id: payment.id
      },
      customer: {
        name: customer.name,
        email: customer.email,
        cpf: customer.cpf,
        phone: customer.phone
      }
    })
  } catch (error) {
    console.error("❌ Erro geral:", error)
    return NextResponse.json({
      error: true,
      message: "Erro interno do servidor",
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
