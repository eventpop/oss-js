import { APIRequestContext, expect } from '@playwright/test'

export class Requestbin {
  url = process.env.REQUESTBIN_URL || 'http://localhost:35124'
  postUrl = this.url + '/post'

  constructor(private request: APIRequestContext) {}

  async post(data: any) {
    const response = await this.request.post(this.postUrl, { data })
    expect(response.status()).toBe(200)
  }

  async assertLog(data: any) {
    const response = await this.request.get(this.url + '/log')
    const body = await response.json()
    expect(body).toContainEqual(data)
  }
}
