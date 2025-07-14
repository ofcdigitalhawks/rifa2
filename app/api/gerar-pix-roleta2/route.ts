import { type NextRequest, NextResponse } from "next/server"
import { NivopayService } from "@/lib/nivopay"
import { generateCustomerData } from "@/lib/fake-data"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nome,
      telefone,
      amount,
      prize_name,
      shipping_option,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      click_id,
      CampaignID,
      CreativeID,
    } = body

    console.log("🏍️ Gerando PIX para Roleta 2")
    console.log("- Nome:", nome)
    console.log("- Telefone:", telefone)
    console.log("- Prêmio:", prize_name)
    console.log("- Frete:", shipping_option)
    console.log("- Valor:", amount)

    // Verificar valor mínimo
    if (amount < 500) {
      return NextResponse.json({
        error: true,
        message: "O valor mínimo permitido é R$ 5,00"
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
    const checkoutUrl = `https://${request.headers.get('host')}/roleta2`
    const referrerUrl = request.headers.get('referer') || ''
    const productTitle = shipping_option ? `Frete Honda Biz 2025 - ${shipping_option}` : 'Frete Honda Biz 2025'

    console.log("🔄 Criando pagamento via Nivopay para Roleta 2...")

    // Criar pagamento via Nivopay
    const paymentResult = await NivopayService.createPayment(
      amount,
      customer,
      productTitle,
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

    const payment = paymentResult as any

    console.log("✅ PIX gerado com sucesso para Roleta 2:", payment.id)

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
        utm_source: '', // Não usado para upsells
        action: 'GENERATED_ROLETA2'
      })
      console.log("💾 Pagamento da Roleta 2 salvo no banco interno")
    } catch (dbError) {
      console.warn("⚠️ Erro ao salvar no banco:", dbError)
    }

    // Retornar dados formatados para o frontend
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
    console.error("❌ Erro geral na geração do PIX da Roleta 2:", error)
    return NextResponse.json({
      error: true,
      message: "Erro interno ao gerar PIX da Roleta 2",
      debug: error instanceof Error ? error.message : String(error)
    })
  }
}
