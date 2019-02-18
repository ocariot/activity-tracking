export interface IConnectionFactory {
    createConnection(_retries: number, _interval: number): Promise<any>
}
