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

require('sinon-mongoose')

describe('Services: Log', () => {
    // Mock logs array
    const correctLogsArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < 5; i++ ) {
        correctLogsArr.push(LogMock.generateLog())
    }

    const incorrectLogsArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < 4; i++ ) {
        incorrectLogsArr.push(LogMock.generateLog())
    }

    const logIncorrect = new Log('20199-03-18', 250, LogType.CALORIES, '5a62be07de34500146d9c544')
    logIncorrect.id = '507f1f77bcf86cd799439011'
    incorrectLogsArr[1] = logIncorrect

    // Mock log with incorrect type
    const logJSON: any = {
        date: '2019-03-18',
        value: 1000,
        type: 'step',
        child_id: '5a62be07de34500146d9c544',
    }

    let otherLogIncorrect = new Log()
    otherLogIncorrect = otherLogIncorrect.fromJSON(logJSON)
    incorrectLogsArr.push(otherLogIncorrect)

    /**
     * Mock MultiStatus responses
     */
    const multiStatusCorrect: MultiStatus<Log> = MultiStatusMock.generateMultiStatus(correctLogsArr) // MultiStatus totally correct
    const multiStatusMixed: MultiStatus<Log> = MultiStatusMock.generateMultiStatus(incorrectLogsArr) // Mixed MultiStatus

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
            it('should return a response of type MultiStatus<Log> with the description of success in sending each log', async () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctLogsArr)
                    .resolves(multiStatusCorrect)

                return await logService.addLogs(correctLogsArr)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.property(result, 'success')
                        assert.property(result, 'error')
                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the logs in the array are correct and already exist in the repository', () => {
            it('should update the value of itens in the repository and return a response of type MultiStatus<Log> with the description ' +
                'of success in sending each log', async () => {
                correctLogsArr.forEach(elem => {
                    elem.date = '2018-03-10'
                })
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctLogsArr)
                    .resolves(multiStatusCorrect)

                return await logService.addLogs(correctLogsArr)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.property(result, 'success')
                        assert.property(result, 'error')
                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the logs in the array are correct and some of them already exist in the repository', () => {
            it('should update the value of the existing itens already in the repository, create the new ones, and return a ' +
                'response of type MultiStatus<Log> with the description of success in sending each log', async () => {
                correctLogsArr.push(LogMock.generateLog())
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctLogsArr)
                    .resolves(multiStatusCorrect)

                return await logService.addLogs(correctLogsArr)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.property(result, 'success')
                        assert.property(result, 'error')
                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when some of the logs in the array are incorrect', () => {
            it('should perform the operations of creating and updating normally for the correct logs and returning a response ' +
                'of type MultiStatus<Log> with the description of success and error cases of each log', async () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectLogsArr)
                    .resolves(multiStatusMixed)

                return await logService.addLogs(incorrectLogsArr)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.property(result, 'success')
                        assert.property(result, 'error')
                    })
            })
        })
    })
})
