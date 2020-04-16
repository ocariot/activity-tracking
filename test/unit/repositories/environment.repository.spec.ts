import sinon from 'sinon'
import { assert } from 'chai'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { EnvironmentRepoModel } from '../../../src/infrastructure/database/schema/environment.schema'
import { IEnvironmentRepository } from '../../../src/application/port/environment.repository.interface'
import { EnvironmentRepository } from '../../../src/infrastructure/repository/environment.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { ObjectID } from 'bson'
import { Environment } from '../../../src/application/domain/model/environment'

require('sinon-mongoose')

describe('Repositories: EnvironmentRepository', () => {
    const defaultEnvironment: EnvironmentMock = new EnvironmentMock()

    const modelFake: any = EnvironmentRepoModel
    const environmentRepo: IEnvironmentRepository = new EnvironmentRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: {
                    'institution_id': defaultEnvironment.institution_id,
                    'timestamp': defaultEnvironment.timestamp,
                    'location.local': defaultEnvironment.location!.local,
                    'location.room': defaultEnvironment.location!.room,
                    'location.latitude': defaultEnvironment.location!.latitude,
                    'location.longitude': defaultEnvironment.location!.longitude
                }
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

                return environmentRepo.checkExist(defaultEnvironment)
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

                return environmentRepo.checkExist(defaultEnvironment)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                environmentRepo.checkExist(defaultEnvironment)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
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

                return environmentRepo.removeAllByInstitution(defaultEnvironment.institution_id!)
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

                return environmentRepo.removeAllByInstitution(randomInstitutionId)
                    .then((result: boolean) => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ institution_id: defaultEnvironment.institution_id })
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return environmentRepo.removeAllByInstitution(defaultEnvironment.institution_id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('count()', () => {
        context('when there is at least one environment in the database', () => {
            it('should return how many environments there are in the database', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .resolves(2)

                return environmentRepo.countByInstitution(defaultEnvironment.institution_id!)
                    .then((countEnvironments: number) => {
                        assert.equal(countEnvironments, 2)
                    })
            })
        })

        context('when there no are environments in database', () => {
            it('should return 0', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .resolves(0)

                return environmentRepo.countByInstitution(defaultEnvironment.institution_id!)
                    .then((countEnvironments: number) => {
                        assert.equal(countEnvironments, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return environmentRepo.countByInstitution(defaultEnvironment.institution_id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findInactiveEnvironments(numberOfDays: number)', () => {
        context('when there is at least one environment registered in the database within the last 3 days',
            () => {
                it('should return how many environments there are in the database with these characteristics',
                    () => {
                        sinon
                            .mock(modelFake)
                            .expects('aggregate')
                            .withArgs()
                            .chain('exec')
                            .resolves([new EnvironmentMock()])

                        return environmentRepo.findInactiveEnvironments(3)
                            .then((result: Array<Environment>) => {
                                assert.equal(result.length, 1)
                            })
                    })
            })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('aggregate')
                    .withArgs()
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return environmentRepo.findInactiveEnvironments(3)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
