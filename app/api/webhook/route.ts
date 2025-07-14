import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { XtrackyService } from "@/lib/xtracky"

export async function POST(request: NextRequest) {
  try {
    // Capturar o payload JSON da Nivopay
    const webhookData = await request.json()
    
    console.log("📬 Webhook recebido:", JSON.stringify(webhookData, null, 2))
    
    // Extrair dados do webhook
    const status = webhookData.status ? webhookData.status.toUpperCase() : ''
    const paymentId = webhookData.paymentId || webhookData.id || ''
    const totalValue = webhookData.totalValue || webhookData.amount || 0
    const customer = webhookData.customer || {}
    const paymentMethod = webhookData.paymentMethod || 'PIX'
    
    if (!paymentId) {
      console.warn("⚠️ Webhook sem paymentId:", webhookData)
      return NextResponse.json({
        success: false,
        error: 'paymentId não fornecido'
      })
    }

    // Salvar no banco interno
    const db = Database
    
    if (status === 'APPROVED' && paymentId) {
      console.log("✅ Pagamento APROVADO - ID:", paymentId, "- Valor:", totalValue)
      
      // Atualizar status no banco interno
      await db.updateStatus(paymentId, status)
      await db.insert({
        payment_id: paymentId,
        status: status,
        amount: totalValue,
        customer_name: customer.name || '',
        customer_email: customer.email || '',
        customer_cpf: customer.cpf || '',
        customer_phone: customer.phone || '',
        payment_method: paymentMethod,
        action: 'WEBHOOK_APPROVED'
      })
      
      // Enviar evento para Xtracky (pagamento aprovado - apenas para front, não upsells)
      try {
        // Tentar recuperar dados do banco de dados
        const paymentRecord = await db.findByPaymentId(paymentId)
        const isUpsell = paymentRecord?.action?.includes('ROLETA') || false
        
        // Só enviar para Xtracky se não for um upsell
        if (!isUpsell) {
          const utm_source = paymentRecord?.utm_source
          const utmSourceForXtracky = utm_source && utm_source.trim() !== '' ? utm_source : undefined
          
          console.log("🔔 UTM Source recuperado do banco (webhook):", utm_source)
          console.log("🔔 UTM Source para Xtracky (webhook):", utmSourceForXtracky)
          
          await XtrackyService.sendPaid(paymentId, totalValue, utmSourceForXtracky)
          console.log("🔔 Evento 'paid' enviado para Xtracky via webhook")
        } else {
          console.log("🔔 Pagamento de upsell (webhook) - não enviando para Xtracky")
        }
      } catch (xtrackyError) {
        console.warn("⚠️ Erro ao enviar evento para Xtracky:", xtrackyError)
        // Não falhar a requisição por erro na Xtracky
      }
      
      return NextResponse.json({
        success: true,
        message: 'Webhook processado com sucesso',
        paymentId: paymentId,
        status: status
      })
    } else {
      console.log("📝 Webhook recebido - Status:", status, "- ID:", paymentId)
      
      // Salvar outros status também
      await db.insert({
        payment_id: paymentId,
        status: status,
        amount: totalValue,
        customer_name: customer.name || '',
        customer_email: customer.email || '',
        customer_cpf: customer.cpf || '',
        customer_phone: customer.phone || '',
        payment_method: paymentMethod,
        action: `WEBHOOK_${status}`
      })
      
      return NextResponse.json({
        success: true,
        message: 'Webhook recebido',
        status: status
      })
    }
    
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
} 