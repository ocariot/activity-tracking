import sinon from 'sinon'
import { assert } from 'chai'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { EnvironmentRepoModel } from '../../../src/infrastructure/database/schema/environment.schema'
import { IEnvironmentRepository } from '../../../src/application/port/environment.repository.interface'
import { EnvironmentRepository } from '../../../src/infrastructure/repository/environment.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'

require('sinon-mongoose')

describe('Repositories: Environment', () => {
    const defaultEnvironment: EnvironmentMock = new EnvironmentMock()

    const modelFake: any = EnvironmentRepoModel
    const repo: IEnvironmentRepository = new EnvironmentRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: {  'timestamp': defaultEnvironment.timestamp,
                            'location.local': defaultEnvironment.location!.local,
                            'location.room': defaultEnvironment.location!.room,
                            'location.latitude': defaultEnvironment.location!.latitude,
                            'location.longitude': defaultEnvironment.location!.longitude }
            }
        }
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('checkExist(environment: Environment)', () => {
        context('when the environment is found', () => {
            it('should return true if exists in search by the filters bellow', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(true)

                return repo.checkExist(defaultEnvironment)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the environment is not found', () => {
            it('should return false', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(false)

                return repo.checkExist(defaultEnvironment)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', async () => {
                defaultEnvironment.timestamp = undefined!

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                try {
                    await repo.checkExist(defaultEnvironment)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                    assert.propertyVal(err, 'description', 'Please try again later...')
                }
            })
        })
    })
})
