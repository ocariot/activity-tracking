import sinon from 'sinon'
import { assert } from 'chai'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { EnvironmentRepoModel } from '../../../src/infrastructure/database/schema/environment.schema'
import { IEnvironmentRepository } from '../../../src/application/port/environment.repository.interface'
import { EnvironmentRepository } from '../../../src/infrastructure/repository/environment.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { ObjectID } from 'bson'

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

    describe('removeAllEnvironmentsFromInstitution(institutionID: string)', () => {
        context('when there is at least one environment associated with that institutionID and the delete operation is ' +
            'done successfully', () => {
            it('should return true for confirm delete', () => {
                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ institution_id: defaultEnvironment.institution_id })
                    .resolves(true)

                return repo.removeAllEnvironmentsFromInstitution(defaultEnvironment.institution_id!)
                    .then((result: boolean) => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when there is no environment associated with that institutionID', () => {
            it('should return false', () => {
                const randomInstitutionId: any = new ObjectID()

                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ institution_id: randomInstitutionId })
                    .resolves(false)

                return repo.removeAllEnvironmentsFromInstitution(randomInstitutionId)
                    .then((result: boolean) => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when the institution_id parameter is invalid', () => {
            it('should throw a RepositoryException', () => {
                defaultEnvironment.institution_id = '1a2b3c'

                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ institution_id: defaultEnvironment.institution_id })
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return repo.removeAllEnvironmentsFromInstitution(defaultEnvironment.institution_id)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
