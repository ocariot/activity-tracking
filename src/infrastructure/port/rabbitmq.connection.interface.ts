export interface IRabbitMQConnection {
    isConnected: boolean

    conn?: any

    tryConnect(retries: number, interval: number): Promise<void>
}
