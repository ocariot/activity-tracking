import sinon from 'sinon'
import { assert } from 'chai'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { Log } from '../../../src/application/domain/model/log'
import { LogMock } from '../../mocks/log.mock'
import { LogRepoModel } from '../../../src/infrastructure/database/schema/log.schema'
import { ILogRepository } from '../../../src/application/port/log.repository.interface'
import { LogRepository } from '../../../src/infrastructure/repository/log.repository'

require('sinon-mongoose')

describe('Repositories: LogRepository', () => {
    const defaultLog: Log = new LogMock()

    const modelFake: any = LogRepoModel
    const repo: ILogRepository = new LogRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: {  child_id: defaultLog.child_id,
                            type: defaultLog.type,
                            date: defaultLog.date.concat('T00:00:00' )}
            }
        }
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('selectByChild(childId: string, logType: string, dateLog: string)', () => {
        context('when the log is found', () => {
            it('should return the log found', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultLog)

                return repo.selectByChild(defaultLog.child_id, defaultLog.type, defaultLog.date)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultLog.id)
                        assert.propertyVal(result, 'date', defaultLog.date)
                        assert.propertyVal(result, 'value', defaultLog.value)
                        assert.propertyVal(result, 'type', defaultLog.type)
                        assert.propertyVal(result, 'child_id', defaultLog.child_id)
                    })
            })
        })

        context('when the log is not found', () => {
            it('should return undefined', () => {
                queryMock.toJSON().filters.date = new Date()

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.selectByChild(defaultLog.child_id, defaultLog.type, defaultLog.date)
                    .then(result => {
                        assert.equal(result, undefined)
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
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return repo.selectByChild(defaultLog.child_id, defaultLog.type, defaultLog.date)
                    .catch((err: any) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
