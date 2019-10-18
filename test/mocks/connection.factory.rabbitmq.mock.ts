import { IConnectionFactory, IEventBusOptions } from '../../src/infrastructure/port/connection.factory.interface'
import { IOcariotRabbitMQClient } from '@ocariot/rabbitmq-client-node/lib'

export class ConnectionFactoryRabbitMQMock implements IConnectionFactory {
    private eventBus: IOcariotRabbitMQClient = {
        close(): Promise<void> {
            return Promise.resolve()
        },
        getApplications(query: string, callback?: (err: any, applications: any) => void): any {

            return Promise.resolve({})
        },
        getChildren(query: string, callback?: (err: any, children: any) => void): any {
            return Promise.resolve({})
        },
        getEducatorChildrenGroups(educatorId: string, callback?: (err: any, childrenGroups: any) => void): any {
            return Promise.resolve({})
        },
        getEducators(query: string, callback?: (err: any, educators: any) => void): any {
            return Promise.resolve({})
        },
        getEnvironments(query: string, callback?: (err: any, result: any) => void): any {
            return Promise.resolve({})
        },
        getFamilies(query: string, callback?: (err: any, families: any) => void): any {
            return Promise.resolve({})
        },
        getFamilyChildren(familyId: string, callback?: (err: any, children: any) => void): any {
            return Promise.resolve({})
        },
        getHealthProfessionalChildrenGroups(healthProfessionalId: string, callback?: (err: any, childrenGroups: any) => void): any {
            return Promise.resolve({})
        },
        getHealthProfessionals(query: string, callback?: (err: any, healthProfessionals: any) => void): any {
            return Promise.resolve({})
        },
        getInstitutions(query: string, callback?: (err: any, institutions: any) => void): any {
            return Promise.resolve({})
        },
        getLogs(childId: string, query: string, callback?: (err: any, result: any) => void): any {
            return Promise.resolve({})
        },
        getPhysicalActivities(query: string, callback?: (err: any, result: any) => void): any {
            return Promise.resolve({})
        },
        getResource(name: string, params: any[], callback?: (err: any, result: any) => any): void | Promise<any> {
            return Promise.resolve()
        },
        getSleep(query: string, callback?: (err: any, result: any) => void): any {
            return Promise.resolve({})
        },
        getWeights(query: string, callback?: (err: any, result: any) => void): any {
            return Promise.resolve({})
        },
        logger(level: string): void {
            //
        },
        on(event: string | symbol, listener: (...args: any[]) => void): void {
            //
        },
        provide(name: string, func: (...any: any[]) => any): void {
            //
        },
        provideApplications(listener: (query: string) => any): Promise<void> {
            return Promise.resolve()
        },
        provideChildren(listener: (query: string) => any): Promise<void> {
            return Promise.resolve()
        },
        provideEducatorChildrenGroups(listener: (educatorId: string) => any): Promise<void> {
            return Promise.resolve()
        },
        provideEducators(listener: (query: string) => any): Promise<void> {
            return Promise.resolve()
        },
        provideEnvironments(listener: (query: string) => any): Promise<void> {
            return Promise.resolve()
        },
        provideFamilies(listener: (query: string) => any): Promise<void> {
            return Promise.resolve()
        },
        provideFamilyChildren(listener: (familyId: string) => any): Promise<void> {
            return Promise.resolve()
        },
        provideHealthProfessionalChildrenGroups(listener: (healthProfessionalId: string) => any): Promise<void> {
            return Promise.resolve()
        },
        provideHealthProfessionals(listener: (query: string) => any): Promise<void> {
            return Promise.resolve()
        },
        provideInstitutions(listener: (query: string) => any): Promise<void> {
            return Promise.resolve()
        },
        provideLogs(listener: (query: string) => any): Promise<void> {
            return Promise.resolve()
        },
        providePhysicalActivities(listener: (query: string) => any): Promise<void> {
            return Promise.resolve()
        },
        provideSleep(listener: (query: string) => any): Promise<void> {
            return Promise.resolve()
        },
        provideWeights(listener: (query: string) => any): Promise<void> {
            return Promise.resolve()
        },
        pub(routingKey: string, body: any): Promise<void> {
            return Promise.resolve()
        },
        pubDeleteEnvironment(environment: any): Promise<void> {
            return Promise.resolve()
        },
        pubDeleteInstitution(institution: any): Promise<void> {
            return Promise.resolve()
        },
        pubDeletePhysicalActivity(activity: any): Promise<void> {
            return Promise.resolve()
        },
        pubDeleteSleep(sleep: any): Promise<void> {
            return Promise.resolve()
        },
        pubDeleteUser(user: any): Promise<void> {
            return Promise.resolve()
        },
        pubDeleteWeight(weight: any): Promise<void> {
            return Promise.resolve()
        },
        pubFitbitAuthError(error: any): Promise<void> {
            return Promise.resolve()
        },
        pubFitbitLastSync(datetime: any): Promise<void> {
            return Promise.resolve()
        },
        pubSaveChild(child: any): Promise<void> {
            return Promise.resolve()
        },
        pubSaveLog(log: any): Promise<void> {
            return Promise.resolve()
        },
        pubSavePhysicalActivity(activity: any): Promise<void> {
            return Promise.resolve()
        },
        pubSaveSleep(sleep: any): Promise<void> {
            return Promise.resolve()
        },
        pubSaveEnvironment(environment: any): Promise<void> {
            return Promise.resolve()
        },
        pubSaveWeight(weight: any): Promise<void> {
            return Promise.resolve()
        },
        pubUpdateApplication(application: any): Promise<void> {
            return Promise.resolve()
        },
        pubUpdateChild(child: any): Promise<void> {
            return Promise.resolve()
        },
        pubUpdateEducator(educator: any): Promise<void> {
            return Promise.resolve()
        },
        pubUpdateFamily(family: any): Promise<void> {
            return Promise.resolve()
        },
        pubUpdateHealthProfessional(healthprofessional: any): Promise<void> {
            return Promise.resolve()
        },
        pubUpdatePhysicalActivity(activity: any): Promise<void> {
            return Promise.resolve()
        },
        pubUpdateSleep(sleep: any): Promise<void> {
            return Promise.resolve()
        },
        pubSyncLog(log: any): Promise<void> {
            return Promise.resolve()
        },
        pubSyncPhysicalActivity(activity: any): Promise<void> {
            return Promise.resolve()
        },
        pubSyncSleep(sleep: any): Promise<void> {
            return Promise.resolve()
        },
        pubSyncWeight(weight: any): Promise<void> {
            return Promise.resolve()
        },
        sub(routingKey: string, callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subDeleteEnvironment(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subDeleteInstitution(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subDeletePhysicalActivity(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subDeleteSleep(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subDeleteUser(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subDeleteWeight(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subFitbitAuthError(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subFitbitLastSync(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subSaveChild(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subSaveEnvironment(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subSaveLog(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subSavePhysicalActivity(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subSaveSleep(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subSaveWeight(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subUpdateApplication(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subUpdateChild(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subUpdateEducator(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subUpdateFamily(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subUpdateHealthProfessional(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subUpdatePhysicalActivity(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subUpdateSleep(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subSyncLog(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subSyncPhysicalActivity(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subSyncSleep(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        },
        subSyncWeight(callback: (message: any) => void): Promise<void> {
            return Promise.resolve()
        }
    }

    public createConnection(uri: string, options?: IEventBusOptions): Promise<any> {
        return Promise.resolve(this.eventBus)
    }
}
