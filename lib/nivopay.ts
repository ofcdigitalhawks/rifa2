// Configuração da API Nivopay
const NIVOPAY_CONFIG = {
  secretKey: '8b220b0b-0d49-4977-8aee-53585f8c6df9',
  apiUrl: 'https://pay.nivopayoficial.com.br/api/v1/transaction.purchase',
  getPaymentUrl: 'https://pay.nivopayoficial.com.br/api/v1/transaction.getPayment'
}

export interface NivopayCustomer {
  name: string
  email: string
  cpf: string
  phone: string
}

export interface NivopayItem {
  unitPrice: number
  title: string
  quantity: number
  tangible: boolean
}

export interface NivopayPaymentRequest {
  paymentMethod: 'PIX'
  amount: number
  items: NivopayItem[]
  utmQuery?: string
  checkoutUrl?: string
  referrerUrl?: string
  externalId: string
  traceable: boolean
  name: string
  email: string
  cpf: string
  phone: string
}

export interface NivopayPaymentResponse {
  id: string
  pixCode: string
  pixQrCode?: string
  amount: number
  status: string
  createdAt: string
  updatedAt?: string
  customer?: NivopayCustomer
  method?: string
  expires_at?: string
  paid_at?: string
}

export interface NivopayError {
  error: boolean
  message: string
  details?: any
}

export class NivopayService {
  private static async makeRequest(
    url: string, 
    method: 'GET' | 'POST' = 'GET', 
    data?: any
  ): Promise<any> {
    const headers: Record<string, string> = {
      'Authorization': NIVOPAY_CONFIG.secretKey,
      'Content-Type': 'application/json'
    }

    const options: RequestInit = {
      method,
      headers
    }

    if (method === 'POST' && data) {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Erro na requisição para Nivopay:', error)
      throw error
    }
  }

  static async createPayment(
    amount: number,
    customer: NivopayCustomer,
    productTitle: string = 'PIX DO MILHAO',
    utmQuery?: string,
    checkoutUrl?: string,
    referrerUrl?: string
  ): Promise<NivopayPaymentResponse | NivopayError> {
    try {
      const paymentData: NivopayPaymentRequest = {
        paymentMethod: 'PIX',
        amount,
        items: [
          {
            unitPrice: amount,
            title: productTitle,
            quantity: 1,
            tangible: false
          }
        ],
        utmQuery: utmQuery || '',
        checkoutUrl: checkoutUrl || '',
        referrerUrl: referrerUrl || '',
        externalId: `pixmilhao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        traceable: true,
        name: customer.name,
        email: customer.email,
        cpf: customer.cpf,
        phone: customer.phone
      }

      const response = await this.makeRequest(
        NIVOPAY_CONFIG.apiUrl, 
        'POST', 
        paymentData
      )

      if (!response.pixCode) {
        return {
          error: true,
          message: 'PIX não gerado pela API',
          details: response
        }
      }

      return {
        id: response.id,
        pixCode: response.pixCode,
        pixQrCode: response.pixQrCode,
        amount: response.amount || amount,
        status: response.status || 'PENDING',
        createdAt: response.createdAt || new Date().toISOString(),
        updatedAt: response.updatedAt,
        customer: response.customer,
        method: response.method || 'PIX',
        expires_at: response.expires_at,
        paid_at: response.paid_at
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error)
      return {
        error: true,
        message: 'Erro ao gerar o PIX',
        details: error instanceof Error ? error.message : String(error)
      }
    }
  }

  static async getPaymentStatus(paymentId: string): Promise<NivopayPaymentResponse | NivopayError> {
    try {
      const cleanId = paymentId.replace(/[^a-zA-Z0-9\-]/g, '')
      const url = `${NIVOPAY_CONFIG.getPaymentUrl}?id=${encodeURIComponent(cleanId)}`
      
      const response = await this.makeRequest(url, 'GET')
      
      const status = response.status ? response.status.toUpperCase() : 'UNKNOWN'
      
      return {
        id: response.id || paymentId,
        pixCode: response.pixCode || '',
        pixQrCode: response.pixQrCode,
        amount: response.amount || 0,
        status,
        createdAt: response.createdAt || '',
        updatedAt: response.updatedAt,
        customer: response.customer,
        method: response.method || 'PIX',
        expires_at: response.expires_at,
        paid_at: response.paid_at
      }
    } catch (error) {
      console.error('Erro ao consultar status do pagamento:', error)
      return {
        error: true,
        message: 'Erro ao verificar status do pagamento',
        details: error instanceof Error ? error.message : String(error)
      }
    }
  }

  static formatAmountToCents(amount: number): number {
    return Math.round(amount * 100)
  }

  static formatAmountFromCents(cents: number): number {
    return cents / 100
  }
} 