import { type NextRequest, NextResponse } from "next/server"
import { NivopayService, type NivopayPaymentResponse } from "@/lib/nivopay"
import { generateCustomerData } from "@/lib/fake-data"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { name, phone, amount, prize_name, utm_source, utm_medium, utm_campaign, utm_term, utm_content, click_id } = await request.json()
    
    // Validar dados obrigatórios
    if (!name || !phone || !amount || !prize_name) {
      return NextResponse.json({
        error: true,
        message: 'Dados incompletos. Nome, telefone, valor e prêmio são obrigatórios.'
      }, { status: 400 })
    }
    
    // Valor mínimo de R$ 10,00
    if (amount < 1000) {
      return NextResponse.json({
        error: true,
        message: 'O valor mínimo é R$ 10,00'
      }, { status: 400 })
    }
    
    // Gerar dados do cliente
    const customerData = await generateCustomerData(true)
    
    const customer = {
      name: name,
      email: customerData.email,
      cpf: customerData.cpf?.replace(/\D/g, ''),
      phone: phone?.replace(/\D/g, '')
    }
    
    // Criar pagamento via Nivopay
    const paymentResult = await NivopayService.createPayment(
      amount,
      customer,
      `ROLETA DA SORTE - ${prize_name}`
    )
    
    // Verificar se houve erro
    if ('error' in paymentResult && paymentResult.error) {
      return NextResponse.json({
        error: true,
        message: paymentResult.message || "Erro ao gerar PIX"
      })
    }
    
    const payment = paymentResult as NivopayPaymentResponse
    
    // Salvar no banco interno
    try {
      await Database.insert({
        payment_id: payment.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_cpf: customer.cpf,
        amount: amount,
        status: 'PENDING',
        pix_code: payment.pixCode,
        payment_method: 'PIX',
        utm_source: '', // Não usado para upsells
        action: 'GENERATED'
      })
    } catch (dbError) {
      // Não falhar a requisição
    }
    
    // Retornar resposta
    return NextResponse.json({
      error: false,
      pix_code: payment.pixCode,
      pix_qr_code: payment.pixQrCode || payment.pixCode,
      qr_code: payment.pixCode,
      transaction_id: payment.id,
      hash: payment.id,
      amount: payment.amount,
      prize_name: prize_name,
      pix: {
        pix_qr_code: payment.pixQrCode || payment.pixCode,
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
    return NextResponse.json({
      error: true,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
