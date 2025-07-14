// Sistema de banco de dados genérico compatível com múltiplas plataformas
// Funciona com Vercel, Netlify, Railway, etc.

export interface PaymentRecord {
  id: string
  payment_id: string
  status: string
  amount: number
  customer_name?: string
  customer_email?: string
  customer_cpf?: string
  customer_phone?: string
  pix_code?: string
  payment_method?: string
  utm_source?: string
  action: string
  created_at: string
  updated_at?: string
}

// Armazenamento em memória (para desenvolvimento e produção simples)
class InMemoryStorage {
  private static data: PaymentRecord[] = []

  static async insert(record: PaymentRecord): Promise<string> {
    this.data.push(record)
    console.log(`💾 Registro salvo em memória: ${record.id}`)
    return record.id
  }

  static async findByPaymentId(paymentId: string): Promise<PaymentRecord | null> {
    return this.data.find(record => record.payment_id === paymentId) || null
  }

  static async updateStatus(paymentId: string, status: string): Promise<boolean> {
    const index = this.data.findIndex(record => record.payment_id === paymentId)
    if (index !== -1) {
      this.data[index].status = status
      this.data[index].updated_at = new Date().toISOString()
      return true
    }
    return false
  }

  static async getAll(): Promise<PaymentRecord[]> {
    return [...this.data]
  }

  static async clearAll(): Promise<boolean> {
    this.data = []
    return true
  }
}

// Armazenamento via API externa (opcional)
class ExternalApiStorage {
  private static baseUrl = process.env.DATABASE_API_URL || ''
  private static apiKey = process.env.DATABASE_API_KEY || ''

  static async insert(record: PaymentRecord): Promise<string> {
    if (!this.baseUrl || !this.apiKey) {
      return InMemoryStorage.insert(record)
    }

    try {
      const response = await fetch(`${this.baseUrl}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(record)
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`💾 Registro salvo via API: ${record.id}`)
        return result.id || record.id
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar via API, usando memória:', error)
      return InMemoryStorage.insert(record)
    }

    return InMemoryStorage.insert(record)
  }

  static async findByPaymentId(paymentId: string): Promise<PaymentRecord | null> {
    if (!this.baseUrl || !this.apiKey) {
      return InMemoryStorage.findByPaymentId(paymentId)
    }

    try {
      const response = await fetch(`${this.baseUrl}/records/payment/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar via API, usando memória:', error)
    }

    return InMemoryStorage.findByPaymentId(paymentId)
  }

  static async updateStatus(paymentId: string, status: string): Promise<boolean> {
    if (!this.baseUrl || !this.apiKey) {
      return InMemoryStorage.updateStatus(paymentId, status)
    }

    try {
      const response = await fetch(`${this.baseUrl}/records/payment/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        return true
      }
    } catch (error) {
      console.warn('⚠️ Erro ao atualizar via API, usando memória:', error)
    }

    return InMemoryStorage.updateStatus(paymentId, status)
  }

  static async getAll(): Promise<PaymentRecord[]> {
    if (!this.baseUrl || !this.apiKey) {
      return InMemoryStorage.getAll()
    }

    try {
      const response = await fetch(`${this.baseUrl}/records`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar via API, usando memória:', error)
    }

    return InMemoryStorage.getAll()
  }

  static async clearAll(): Promise<boolean> {
    if (!this.baseUrl || !this.apiKey) {
      return InMemoryStorage.clearAll()
    }

    try {
      const response = await fetch(`${this.baseUrl}/records`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (response.ok) {
        return true
      }
    } catch (error) {
      console.warn('⚠️ Erro ao limpar via API, usando memória:', error)
    }

    return InMemoryStorage.clearAll()
  }
}

export class Database {
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private static getStorage() {
    // Usar API externa se configurada, senão usar memória
    const useExternalApi = process.env.DATABASE_API_URL && process.env.DATABASE_API_KEY
    return useExternalApi ? ExternalApiStorage : InMemoryStorage
  }

  static async insert(record: Omit<PaymentRecord, 'id' | 'created_at'>): Promise<string> {
    const id = this.generateId()
    const fullRecord: PaymentRecord = {
      ...record,
      id,
      created_at: new Date().toISOString()
    }

    const storage = this.getStorage()
    return await storage.insert(fullRecord)
  }

  static async findByPaymentId(paymentId: string): Promise<PaymentRecord | null> {
    const storage = this.getStorage()
    return await storage.findByPaymentId(paymentId)
  }

  static async updateStatus(paymentId: string, status: string): Promise<boolean> {
    const storage = this.getStorage()
    return await storage.updateStatus(paymentId, status)
  }

  static async getAll(): Promise<PaymentRecord[]> {
    const storage = this.getStorage()
    return await storage.getAll()
  }

  static async clearAll(): Promise<boolean> {
    const storage = this.getStorage()
    return await storage.clearAll()
  }
}

// Função para configurar banco de dados externo (opcional)
export function configureDatabaseAPI(apiUrl: string, apiKey: string) {
  process.env.DATABASE_API_URL = apiUrl
  process.env.DATABASE_API_KEY = apiKey
  console.log('💾 Banco de dados externo configurado:', apiUrl)
} 