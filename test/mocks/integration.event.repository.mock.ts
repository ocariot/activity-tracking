import { IIntegrationEventRepository } from '../../src/application/port/integration.event.repository.interface'

export class IntegrationEventRepositoryMock implements IIntegrationEventRepository {
    public count(query: any): Promise<number> {
        return Promise.resolve(1)
    }

    public create(item: any): Promise<any> {
        return Promise.resolve(item)
    }

    public delete(id: string | number): Promise<boolean> {
        return Promise.resolve(true)
    }

    public find(query: any): Promise<Array<any>> {
        return Promise.resolve(new Array<any>())
    }

    public findOne(query: any): Promise<any> {
        return Promise.resolve()
    }

    public update(item: any): Promise<any> {
        return Promise.resolve(item)
    }

}
