import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { Environment } from '../../../src/application/domain/model/environment'
import { assert } from 'chai'
import { EnvironmentRepoModel } from '../../../src/infrastructure/database/schema/environment.schema'
import { EnvironmentEntityMapper } from '../../../src/infrastructure/entity/mapper/environment.entity.mapper'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Default } from '../../../src/utils/default'
import { IEnvironmentRepository } from '../../../src/application/port/environment.repository.interface'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const environmentRepo: IEnvironmentRepository = DIContainer.get(Identifier.ENVIRONMENT_REPOSITORY)

// TODO This test is being used for development purposes only
describe('Task: Environments', () => {

    const defaultEnvironment: Environment = new EnvironmentMock()

    // Start services
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

            await deleteAllEnvironments()
        } catch (err) {
            throw new Error('Failure on environments task test: ' + err.message)
        }
    })
    // Delete all environments from the database
    after(async () => {
        try {
            await deleteAllEnvironments()
            await dbConnection.dispose()
        } catch (err) {
            throw new Error('Failure on environments task test: ' + err.message)
        }
    })

    describe('findByTimestamp(numberOfDays: number)', () => {
        before(async() => {
            await deleteAllEnvironments()

            defaultEnvironment.timestamp = new Date('2020-03-20T14:40:00Z')

            await createEnvironment({
                institution_id: defaultEnvironment.institution_id,
                location: defaultEnvironment.location,
                measurements: defaultEnvironment.measurements,
                climatized: defaultEnvironment.climatized,
                timestamp: defaultEnvironment.timestamp
            })


            defaultEnvironment.timestamp = new Date('2020-03-21T14:40:00Z')
            await createEnvironment({
                institution_id: defaultEnvironment.institution_id,
                location: defaultEnvironment.location,
                measurements: defaultEnvironment.measurements,
                climatized: defaultEnvironment.climatized,
                timestamp: defaultEnvironment.timestamp
            })

            defaultEnvironment.timestamp = new Date('2020-03-22T14:40:00Z')
            await createEnvironment({
                institution_id: defaultEnvironment.institution_id,
                location: defaultEnvironment.location,
                measurements: defaultEnvironment.measurements,
                climatized: defaultEnvironment.climatized,
                timestamp: defaultEnvironment.timestamp
            })

            defaultEnvironment.timestamp = new Date('2020-03-28T16:49:55Z')
            await createEnvironment({
                institution_id: defaultEnvironment.institution_id,
                location: defaultEnvironment.location,
                measurements: defaultEnvironment.measurements,
                climatized: defaultEnvironment.climatized,
                timestamp: defaultEnvironment.timestamp
            })
        })
        context('when there is at least one environment in the database', () => {
            it('should return how many environments there are in the database', () => {
                return environmentRepo.findByTimestamp(5)
                    .then((result: Array<Environment>) => {
                        assert.equal(result.length, 1)
                    })
            })
        })
    })
})

async function createEnvironment(item): Promise<any> {
    const environmentMapper: EnvironmentEntityMapper = new EnvironmentEntityMapper()
    const resultModel = environmentMapper.transform(item)
    const resultModelEntity = environmentMapper.transform(resultModel)
    return await Promise.resolve(EnvironmentRepoModel.create(resultModelEntity))
}

async function deleteAllEnvironments() {
    return EnvironmentRepoModel.deleteMany({})
}
