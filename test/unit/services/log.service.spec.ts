import sinon from 'sinon'
import { assert } from 'chai'
import { LogMock } from '../../mocks/log.mock'
import { Log, LogType } from '../../../src/application/domain/model/log'
import { ActivityLogRepoModel } from '../../../src/infrastructure/database/schema/activity.log.schema'
import { ILogRepository } from '../../../src/application/port/log.repository.interface'
import { LogRepositoryMock } from '../../mocks/log.repository.mock'
import { ILogService } from '../../../src/application/port/log.service.interface'
import { LogService } from '../../../src/application/service/log.service'
import { MultiStatusMock } from '../../mocks/multi.status.mock'
import { MultiStatus } from '../../../src/application/domain/model/multi.status'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { Strings } from '../../../src/utils/strings'

require('sinon-mongoose')

describe('Services: Log', () => {
    // Mock correct logs array
    const correctLogsArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < 5; i++ ) {
        correctLogsArr.push(LogMock.generateLog())
    }

    // Mock correct and incorrect logs array
    const mixedLogsArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < 4; i++ ) {
        mixedLogsArr.push(LogMock.generateLog())
    }

    // Incorrect log (invalid date)
    const incorrectLog = new Log('20199-03-08', 250, LogType.CALORIES, '5a62be07de34500146d9c544')
    incorrectLog.id = '507f1f77bcf86cd799439011'
    mixedLogsArr[1] = incorrectLog

    // Mock other incorrect log with invalid type
    const logJSON: any = {
        date: '2019-03-18',
        value: 1000,
        type: 'step',
        child_id: '5a62be07de34500146d9c544',
    }

    let otherLogIncorrect = new Log()
    otherLogIncorrect = otherLogIncorrect.fromJSON(logJSON)
    mixedLogsArr.push(otherLogIncorrect)

    /**
     * Mock MultiStatus responses
     */
    const multiStatusCorrect: MultiStatus<Log> = MultiStatusMock.generateMultiStatus(correctLogsArr) // MultiStatus totally correct
    const multiStatusMixed: MultiStatus<Log> = MultiStatusMock.generateMultiStatus(mixedLogsArr) // Mixed MultiStatus

    const modelFake = ActivityLogRepoModel
    const logRepo: ILogRepository = new LogRepositoryMock()

    const logService: ILogService = new LogService(logRepo)

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method: addLogs(activityLogs: Array<Log>)
     */
    describe('addLogs(activityLogs: Array<Log>)', () => {
        context('when all the logs in the array are correct and it still does not exist in the repository', () => {
            it('should return a response of type MultiStatus<Log> with the description of success in sending each log',  () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctLogsArr)
                    .resolves(multiStatusCorrect)

                return  logService.addLogs(correctLogsArr)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.property(result, 'success')
                        assert.property(result, 'error')
                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the logs in the array are correct and already exist in the repository', () => {
            it('should update the value of items in the repository and return a response of type MultiStatus<Log> with the description ' +
                'of success in sending each log',  () => {
                correctLogsArr.forEach(elem => {
                    elem.date = '2018-03-10'
                })
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctLogsArr)
                    .resolves(multiStatusCorrect)

                return  logService.addLogs(correctLogsArr)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.property(result, 'success')
                        assert.property(result, 'error')
                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the logs in the array are correct and some of them already exist in the repository', () => {
            it('should update the value of the existing items already in the repository, create the new ones, and return a ' +
                'response of type MultiStatus<Log> with the description of success in sending each log',  () => {
                correctLogsArr.push(LogMock.generateLog())
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctLogsArr)
                    .resolves(multiStatusCorrect)

                return  logService.addLogs(correctLogsArr)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.property(result, 'success')
                        assert.property(result, 'error')
                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when some of the logs in the array are incorrect (date and type are invalid)', () => {
            it('should perform the operations of creating and updating normally for the correct logs and returning a response ' +
                'of type MultiStatus<Log> with the description of success and error cases of each log',  () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(mixedLogsArr)
                    .resolves(multiStatusMixed)

                return  logService.addLogs(mixedLogsArr)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.property(result, 'success')
                        assert.property(result, 'error')
                    })
            })
        })

        context('when some of the logs in the array are incorrect (negative value)', () => {
            it('should perform the operations of creating and updating normally for the correct logs and returning a response ' +
                'of type MultiStatus<Log> with the description of success and error cases of each log',  () => {
                incorrectLog.date = '2019-03-10'
                incorrectLog.value = -((Math.floor(Math.random() * 10 + 1)) * 100)
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(mixedLogsArr)
                    .resolves(multiStatusMixed)

                return  logService.addLogs(mixedLogsArr)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.property(result, 'success')
                        assert.property(result, 'error')
                    })
            })
        })

        context('when some of the logs in the array are incorrect (child_id is invalid)', () => {
            it('should perform the operations of creating and updating normally for the correct logs and returning a response ' +
                'of type MultiStatus<Log> with the description of success and error cases of each log',  () => {
                incorrectLog.value = ((Math.floor(Math.random() * 10 + 1)) * 100)
                incorrectLog.child_id = '507f1f77bcf86cd7994390112'
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(mixedLogsArr)
                    .resolves(multiStatusMixed)

                return  logService.addLogs(mixedLogsArr)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.property(result, 'success')
                        assert.property(result, 'error')
                    })
            })
        })

        context('when some of the logs in the array are incorrect (missing fields)', () => {
            it('should perform the operations of creating and updating normally for the correct logs and returning a response ' +
                'of type MultiStatus<Log> with the description of success and error cases of each log',  () => {
                incorrectLog.date = ''
                incorrectLog.value = undefined!
                incorrectLog.type = undefined!
                incorrectLog.child_id = ''
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(mixedLogsArr)
                    .resolves(multiStatusMixed)

                return  logService.addLogs(mixedLogsArr)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.property(result, 'success')
                        assert.property(result, 'error')
                    })
            })
        })
    })

    /**
     * Method: getByChildAndDate(childId: string, dateStart: Date, dateEnd: Date, query: IQuery)
     */
    describe('getByChildAndDate(childId: string, dateStart: Date, dateEnd: Date, query: IQuery)', () => {
        context('when the parameters are correct and there are corresponding logs with the query', () => {
            it('should return a PhysicalActivityLog with steps and/or calories logs',  () => {
                const query: IQuery = new Query()
                query.filters = {
                    child_id: correctLogsArr[0].child_id,
                    $and: [
                        { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                        { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
                    ]
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .resolves(correctLogsArr)

                return  logService.getByChildAndDate(correctLogsArr[0].child_id, correctLogsArr[0].date,
                    correctLogsArr[1].date, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when the parameters are correct but there are no corresponding logs with the query', () => {
            it('should return an empty PhysicalActivityLog',  () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = {
                    child_id: correctLogsArr[0].child_id,
                    $and: [
                        { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                        { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
                    ]
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .resolves(correctLogsArr)

                return  logService.getByChildAndDate(correctLogsArr[0].child_id, correctLogsArr[0].date,
                    correctLogsArr[1].date, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isEmpty(result.steps)
                        assert.isEmpty(result.calories)
                    })
            })
        })

        context('when the parameters are incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', async () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd7994390112'
                const query: IQuery = new Query()
                query.filters = {
                    child_id: correctLogsArr[0].child_id,
                    $and: [
                        { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                        { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
                    ]
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .resolves(correctLogsArr)

                try {
                    return await logService.getByChildAndDate(correctLogsArr[0].child_id, correctLogsArr[0].date,
                        correctLogsArr[1].date, query)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the parameters are incorrect (dateStart is invalid)', () => {
            it('should throw a ValidationException', async () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd799439011'
                correctLogsArr[0].date = '20199-03-18'
                const query: IQuery = new Query()
                query.filters = {
                    child_id: correctLogsArr[0].child_id,
                    $and: [
                        { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                        { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
                    ]
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .resolves(correctLogsArr)

                try {
                    return await logService.getByChildAndDate(correctLogsArr[0].child_id, correctLogsArr[0].date,
                        correctLogsArr[1].date, query)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Date parameter: 20199-03-18, is not in valid ISO 8601 format.')
                    assert.propertyVal(err, 'description', 'Date must be in the format: yyyy-MM-dd')
                }
            })
        })

        context('when the parameters are incorrect (dateEnd is invalid)', () => {
            it('should throw a ValidationException', async () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd799439011'
                correctLogsArr[0].date = '2019-03-18'
                correctLogsArr[1].date = '20199-03-18'
                const query: IQuery = new Query()
                query.filters = {
                    child_id: correctLogsArr[0].child_id,
                    $and: [
                        { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                        { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
                    ]
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .resolves(correctLogsArr)

                try {
                    return await logService.getByChildAndDate(correctLogsArr[0].child_id, correctLogsArr[0].date,
                        correctLogsArr[1].date, query)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Date parameter: 20199-03-18, is not in valid ISO 8601 format.')
                    assert.propertyVal(err, 'description', 'Date must be in the format: yyyy-MM-dd')
                }
            })
        })
    })

    /**
     * Method: getByChildResourceAndDate(childId: string, desiredResource: LogType, dateStart: string, dateEnd: string, query: IQuery)
     */
    describe('getByChildResourceAndDate(childId: string, desiredResource: LogType, dateStart: string, dateEnd: string, ' +
        'query: IQuery)', () => {
        context('when the parameters are correct and there are corresponding logs with the query', () => {
            it('should return the logs array', () => {
                correctLogsArr[1] = LogMock.generateLog()
                const query: IQuery = new Query()
                query.filters = {
                    child_id: correctLogsArr[0].child_id,
                    type: correctLogsArr[0].type,
                    $and: [
                        { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                        { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
                    ]
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .resolves(correctLogsArr)

                return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, correctLogsArr[0].type,
                    correctLogsArr[0].date, correctLogsArr[1].date, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when the parameters are correct but there are no corresponding logs with the query', () => {
            it('should return an empty log array', () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = {
                    child_id: correctLogsArr[0].child_id,
                    $and: [
                        { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                        { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
                    ]
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .resolves(correctLogsArr)

                return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, correctLogsArr[0].type,
                    correctLogsArr[0].date, correctLogsArr[1].date, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when the parameters are incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd7994390112'
                const query: IQuery = new Query()
                query.filters = {
                    child_id: correctLogsArr[0].child_id,
                    $and: [
                        { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                        { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
                    ]
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .resolves(correctLogsArr)

                try {
                    return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, correctLogsArr[0].type,
                        correctLogsArr[0].date, correctLogsArr[1].date, query)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the parameters are incorrect (type is invalid)', () => {
            it('should throw a ValidationException', () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = {
                    child_id: correctLogsArr[0].child_id,
                    $and: [
                        { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                        { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
                    ]
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .resolves(correctLogsArr)

                try {
                    return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, otherLogIncorrect.type,
                        correctLogsArr[0].date, correctLogsArr[1].date, query)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'The name of type provided "step" is not supported...')
                    assert.propertyVal(err, 'description', 'The names of the allowed types are: steps, calories.')
                }
            })
        })

        context('when the parameters are incorrect (dateStart is invalid)', () => {
            it('should throw a ValidationException', () => {
                correctLogsArr[0].date = '20199-03-18'
                const query: IQuery = new Query()
                query.filters = {
                    child_id: correctLogsArr[0].child_id,
                    $and: [
                        { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                        { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
                    ]
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .resolves(correctLogsArr)

                try {
                    return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, correctLogsArr[0].type,
                        correctLogsArr[0].date, correctLogsArr[1].date, query)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Date parameter: 20199-03-18, is not in valid ISO 8601 format.')
                    assert.propertyVal(err, 'description', 'Date must be in the format: yyyy-MM-dd')
                }
            })
        })

        context('when the parameters are incorrect (dateEnd is invalid)', () => {
            it('should throw a ValidationException', () => {
                correctLogsArr[0].date = '2019-03-18'
                correctLogsArr[1].date = '20199-03-18'
                const query: IQuery = new Query()
                query.filters = {
                    child_id: correctLogsArr[0].child_id,
                    $and: [
                        { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                        { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
                    ]
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .resolves(correctLogsArr)

                try {
                    return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, correctLogsArr[0].type,
                        correctLogsArr[0].date, correctLogsArr[1].date, query)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Date parameter: 20199-03-18, is not in valid ISO 8601 format.')
                    assert.propertyVal(err, 'description', 'Date must be in the format: yyyy-MM-dd')
                }
            })
        })
    })
})
