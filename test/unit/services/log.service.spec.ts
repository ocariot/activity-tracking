import HttpStatus from 'http-status-codes'
import { assert } from 'chai'
import { LogMock } from '../../mocks/log.mock'
import { Log, LogType } from '../../../src/application/domain/model/log'
import { ILogRepository } from '../../../src/application/port/log.repository.interface'
import { LogRepositoryMock } from '../../mocks/log.repository.mock'
import { ILogService } from '../../../src/application/port/log.service.interface'
import { LogService } from '../../../src/application/service/log.service'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { Strings } from '../../../src/utils/strings'

describe('Services: Log', () => {
    // Mock correct logs array
    const correctLogsArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < 5; i++ ) {
        correctLogsArr.push(new LogMock())
    }

    // Mock correct and incorrect logs array
    const mixedLogsArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < 4; i++ ) {
        mixedLogsArr.push(new LogMock())
    }

    // Incorrect log (invalid date)
    const incorrectLog = new Log('20199-03-08', 250, LogType.CALORIES, '5a62be07de34500146d9c544')
    incorrectLog.id = '507f1f77bcf86cd799439011'
    mixedLogsArr.push(incorrectLog)

    // Mock other incorrect log with invalid type
    const logJSON: any = {
        id: '507f1f77bcf86cd799439011',
        date: '2019-03-18',
        value: 1000,
        type: 'step',
        child_id: '5a62be07de34500146d9c544',
    }

    let otherIncorrectLog = new Log()
    otherIncorrectLog = otherIncorrectLog.fromJSON(logJSON)
    mixedLogsArr.push(new Log().fromJSON(logJSON))

    // Mock incorrect logs array
    const incorrectLogsArr: Array<Log> = new Array<Log>()
    incorrectLogsArr.push(incorrectLog)
    incorrectLogsArr.push(otherIncorrectLog)

    const logRepo: ILogRepository = new LogRepositoryMock()

    const logService: ILogService = new LogService(logRepo)

    /**
     * Method: addLogs(logs: Array<Log>)
     */
    describe('addLogs(logs: Array<Log>)', () => {
        context('when all the logs in the array are correct and it still does not exist in the repository', () => {
            it('should return a response of type MultiStatus<Log> with the description of success in sending each log',  () => {
                return  logService.addLogs(correctLogsArr)
                    .then(result => {
                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctLogsArr[i].id)
                            assert.propertyVal(result.success[i].item, 'date', correctLogsArr[i].date)
                            assert.propertyVal(result.success[i].item, 'value', correctLogsArr[i].value)
                            assert.propertyVal(result.success[i].item, 'type', correctLogsArr[i].type)
                            assert.propertyVal(result.success[i].item, 'child_id', correctLogsArr[i].child_id)
                        }
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

                return  logService.addLogs(correctLogsArr)
                    .then(result => {
                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctLogsArr[i].id)
                            assert.propertyVal(result.success[i].item, 'date', correctLogsArr[i].date)
                            assert.propertyVal(result.success[i].item, 'value', correctLogsArr[i].value)
                            assert.propertyVal(result.success[i].item, 'type', correctLogsArr[i].type)
                            assert.propertyVal(result.success[i].item, 'child_id', correctLogsArr[i].child_id)
                        }
                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the logs in the array are correct and some of them already exist in the repository', () => {
            it('should update the value of the existing items already in the repository, create the new ones, and return a ' +
                'response of type MultiStatus<Log> with the description of success in sending each log',  () => {
                correctLogsArr.push(new LogMock(LogType.STEPS))

                return  logService.addLogs(correctLogsArr)
                    .then(result => {
                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctLogsArr[i].id)
                            assert.propertyVal(result.success[i].item, 'date', correctLogsArr[i].date)
                            assert.propertyVal(result.success[i].item, 'value', correctLogsArr[i].value)
                            assert.propertyVal(result.success[i].item, 'type', correctLogsArr[i].type)
                            assert.propertyVal(result.success[i].item, 'child_id', correctLogsArr[i].child_id)
                        }
                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the logs in the array are incorrect', () => {
            it('should return a response of type MultiStatus<Log> with the description of error in sending each log',  () => {
                correctLogsArr.push(new LogMock(LogType.STEPS))

                return  logService.addLogs(incorrectLogsArr)
                    .then(result => {
                        assert.propertyVal(result.error[0], 'message',
                            'Date parameter: 20199-03-08, is not in valid ISO 8601 format.')
                        assert.propertyVal(result.error[0], 'description',
                            'Date must be in the format: yyyy-MM-dd')
                        assert.propertyVal(result.error[1], 'message',
                            'The name of type provided "step" is not supported...')
                        assert.propertyVal(result.error[1], 'description',
                            'The names of the allowed types are: ' +
                            'steps, calories, active_minutes, lightly_active_minutes, sedentary_minutes.')

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.BAD_REQUEST)
                            assert.propertyVal(result.error[i].item, 'id', incorrectLogsArr[i].id)
                            assert.propertyVal(result.error[i].item, 'date', incorrectLogsArr[i].date)
                            assert.propertyVal(result.error[i].item, 'value', incorrectLogsArr[i].value)
                            assert.propertyVal(result.error[i].item, 'type', incorrectLogsArr[i].type)
                            assert.propertyVal(result.error[i].item, 'child_id', incorrectLogsArr[i].child_id)
                        }

                        assert.isEmpty(result.success)
                    })
            })
        })

        context('when some of the logs in the array are incorrect (date and type are invalid)', () => {
            it('should perform the operations of creating and updating normally for the correct logs and returning a response ' +
                'of type MultiStatus<Log> with the description of success and error cases of each log',  () => {
                return  logService.addLogs(mixedLogsArr)
                    .then(result => {
                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', mixedLogsArr[i].id)
                            assert.propertyVal(result.success[i].item, 'date', mixedLogsArr[i].date)
                            assert.propertyVal(result.success[i].item, 'value', mixedLogsArr[i].value)
                            assert.propertyVal(result.success[i].item, 'type', mixedLogsArr[i].type)
                            assert.propertyVal(result.success[i].item, 'child_id', mixedLogsArr[i].child_id)
                        }

                        assert.propertyVal(result.error[0], 'message',
                            'Date parameter: 20199-03-08, is not in valid ISO 8601 format.')
                        assert.propertyVal(result.error[0], 'description',
                            'Date must be in the format: yyyy-MM-dd')
                        assert.propertyVal(result.error[1], 'message',
                            'The name of type provided "step" is not supported...')
                        assert.propertyVal(result.error[1], 'description',
                            'The names of the allowed types are: ' +
                            'steps, calories, active_minutes, lightly_active_minutes, sedentary_minutes.')

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.BAD_REQUEST)
                            assert.propertyVal(result.error[i].item, 'id', mixedLogsArr[i + 4].id)
                            assert.propertyVal(result.error[i].item, 'date', mixedLogsArr[i + 4].date)
                            assert.propertyVal(result.error[i].item, 'value', mixedLogsArr[i + 4].value)
                            assert.propertyVal(result.error[i].item, 'type', mixedLogsArr[i + 4].type)
                            assert.propertyVal(result.error[i].item, 'child_id', mixedLogsArr[i + 4].child_id)
                        }
                    })
            })
        })

        context('when some of the logs in the array are incorrect (negative value)', () => {
            it('should perform the operations of creating and updating normally for the correct logs and returning a response ' +
                'of type MultiStatus<Log> with the description of success and error cases of each log',  () => {
                incorrectLog.date = '2019-03-10'
                incorrectLog.value = -((Math.floor(Math.random() * 10 + 1)) * 100)

                return  logService.addLogs(mixedLogsArr)
                    .then(result => {
                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', mixedLogsArr[i].id)
                            assert.propertyVal(result.success[i].item, 'date', mixedLogsArr[i].date)
                            assert.propertyVal(result.success[i].item, 'value', mixedLogsArr[i].value)
                            assert.propertyVal(result.success[i].item, 'type', mixedLogsArr[i].type)
                            assert.propertyVal(result.success[i].item, 'child_id', mixedLogsArr[i].child_id)
                        }

                        assert.propertyVal(result.error[0], 'message',
                            'Value field is invalid...')
                        assert.propertyVal(result.error[0], 'description',
                            'Child log validation failed: The value provided has a negative value!')
                        assert.propertyVal(result.error[1], 'message',
                            'The name of type provided "step" is not supported...')
                        assert.propertyVal(result.error[1], 'description',
                            'The names of the allowed types are: ' +
                            'steps, calories, active_minutes, lightly_active_minutes, sedentary_minutes.')

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.BAD_REQUEST)
                            assert.propertyVal(result.error[i].item, 'id', mixedLogsArr[i + 4].id)
                            assert.propertyVal(result.error[i].item, 'date', mixedLogsArr[i + 4].date)
                            assert.propertyVal(result.error[i].item, 'value', mixedLogsArr[i + 4].value)
                            assert.propertyVal(result.error[i].item, 'type', mixedLogsArr[i + 4].type)
                            assert.propertyVal(result.error[i].item, 'child_id', mixedLogsArr[i + 4].child_id)
                        }
                    })
            })
        })

        context('when some of the logs in the array are incorrect (child_id is invalid)', () => {
            it('should perform the operations of creating and updating normally for the correct logs and returning a response ' +
                'of type MultiStatus<Log> with the description of success and error cases of each log',  () => {
                incorrectLog.value = ((Math.floor(Math.random() * 10 + 1)) * 100)
                incorrectLog.child_id = '507f1f77bcf86cd7994390112'

                return  logService.addLogs(mixedLogsArr)
                    .then(result => {
                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', mixedLogsArr[i].id)
                            assert.propertyVal(result.success[i].item, 'date', mixedLogsArr[i].date)
                            assert.propertyVal(result.success[i].item, 'value', mixedLogsArr[i].value)
                            assert.propertyVal(result.success[i].item, 'type', mixedLogsArr[i].type)
                            assert.propertyVal(result.success[i].item, 'child_id', mixedLogsArr[i].child_id)
                        }

                        assert.propertyVal(result.error[0], 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(result.error[0], 'description',
                            Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                        assert.propertyVal(result.error[1], 'message',
                            'The name of type provided "step" is not supported...')
                        assert.propertyVal(result.error[1], 'description',
                            'The names of the allowed types are: ' +
                            'steps, calories, active_minutes, lightly_active_minutes, sedentary_minutes.')

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.BAD_REQUEST)
                            assert.propertyVal(result.error[i].item, 'id', mixedLogsArr[i + 4].id)
                            assert.propertyVal(result.error[i].item, 'date', mixedLogsArr[i + 4].date)
                            assert.propertyVal(result.error[i].item, 'value', mixedLogsArr[i + 4].value)
                            assert.propertyVal(result.error[i].item, 'type', mixedLogsArr[i + 4].type)
                            assert.propertyVal(result.error[i].item, 'child_id', mixedLogsArr[i + 4].child_id)
                        }
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

                return  logService.addLogs(mixedLogsArr)
                    .then(result => {
                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', mixedLogsArr[i].id)
                            assert.propertyVal(result.success[i].item, 'date', mixedLogsArr[i].date)
                            assert.propertyVal(result.success[i].item, 'value', mixedLogsArr[i].value)
                            assert.propertyVal(result.success[i].item, 'type', mixedLogsArr[i].type)
                            assert.propertyVal(result.success[i].item, 'child_id', mixedLogsArr[i].child_id)
                        }

                        assert.propertyVal(result.error[0], 'message',
                            'Required fields were not provided...')
                        assert.propertyVal(result.error[0], 'description',
                            'Child log validation failed: type, date, value, child_id is required!')
                        assert.propertyVal(result.error[1], 'message',
                            'The name of type provided "step" is not supported...')
                        assert.propertyVal(result.error[1], 'description',
                            'The names of the allowed types are: ' +
                            'steps, calories, active_minutes, lightly_active_minutes, sedentary_minutes.')

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.BAD_REQUEST)
                            assert.propertyVal(result.error[i].item, 'id', mixedLogsArr[i + 4].id)
                            assert.propertyVal(result.error[i].item, 'date', mixedLogsArr[i + 4].date)
                            assert.propertyVal(result.error[i].item, 'value', mixedLogsArr[i + 4].value)
                            assert.propertyVal(result.error[i].item, 'type', mixedLogsArr[i + 4].type)
                            assert.propertyVal(result.error[i].item, 'child_id', mixedLogsArr[i + 4].child_id)
                        }
                    })
            })
        })
    })

    /**
     * Method: getByChildAndDate(childId: string, dateStart: Date, dateEnd: Date, query: IQuery)
     */
    describe('getByChildAndDate(childId: string, dateStart: Date, dateEnd: Date, query: IQuery)', () => {

        const query: IQuery = new Query()
        query.filters = {
            child_id: correctLogsArr[0].child_id,
            $and: [
                { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
            ]
        }

        context('when the parameters are correct and there are corresponding logs with the query', () => {
            it('should return a ChildLog with steps and/or calories logs',  () => {

                return  logService.getByChildAndDate(correctLogsArr[0].child_id, correctLogsArr[0].date,
                    correctLogsArr[1].date, query)
                    .then(result => {
                        assert.property(result, 'steps')
                        assert.property(result, 'calories')
                    })
            })
        })

        context('when the parameters are correct but there are no corresponding logs with the query', () => {
            it('should return an empty ChildLog',  () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd799439011'

                return  logService.getByChildAndDate(correctLogsArr[0].child_id, correctLogsArr[0].date,
                    correctLogsArr[1].date, query)
                    .then(result => {
                        assert.isEmpty(result.steps)
                        assert.isEmpty(result.calories)
                    })
            })
        })

        context('when the parameters are incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', async () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd7994390112'

                try {
                    return await logService.getByChildAndDate(correctLogsArr[0].child_id, correctLogsArr[0].date,
                        correctLogsArr[1].date, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the parameters are incorrect (dateStart is invalid)', () => {
            it('should throw a ValidationException', async () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd799439011'
                correctLogsArr[0].date = '20199-03-18'

                try {
                    return await logService.getByChildAndDate(correctLogsArr[0].child_id, correctLogsArr[0].date,
                        correctLogsArr[1].date, query)
                } catch (err) {
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

                try {
                    return await logService.getByChildAndDate(correctLogsArr[0].child_id, correctLogsArr[0].date,
                        correctLogsArr[1].date, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Date parameter: 20199-03-18, is not in valid ISO 8601 format.')
                    assert.propertyVal(err, 'description', 'Date must be in the format: yyyy-MM-dd')
                }
            })
        })

        context('when the parameters are invalid (date range is invalid)', () => {
            it('should throw a ValidationException', async () => {

                try {
                    return await logService.getByChildAndDate(correctLogsArr[0].child_id, '2018-03-18',
                        '2019-03-27', query)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Date range is invalid...')
                    assert.propertyVal(err, 'description', 'Log dates range validation failed: ' +
                        'The period between the received dates is longer than one year')
                }
            })
        })
    })

    /**
     * Method: getByChildResourceAndDate(childId: string, desiredResource: LogType, dateStart: string, dateEnd: string, query: IQuery)
     */
    describe('getByChildResourceAndDate(childId: string, desiredResource: LogType, dateStart: string, dateEnd: string, ' +
        'query: IQuery)', () => {

        const query: IQuery = new Query()
        query.filters = {
            child_id: correctLogsArr[0].child_id,
            type: correctLogsArr[0].type,
            $and: [
                { date: { $lte: correctLogsArr[0].date.toString().concat('T00:00:00') } },
                { date: { $gte: correctLogsArr[1].date.toString().concat('T00:00:00') } }
            ]
        }

        context('when the parameters are correct and there are corresponding logs with the query', () => {
            it('should return the logs array', () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd799439012'
                correctLogsArr[1].date = '2019-03-20'

                return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, correctLogsArr[0].type,
                    correctLogsArr[0].date, correctLogsArr[1].date, query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when the parameters are correct but there are no corresponding logs with the query', () => {
            it('should return an empty log array', () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd799439011'

                return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, correctLogsArr[0].type,
                    correctLogsArr[0].date, correctLogsArr[1].date, query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when the parameters are incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd7994390112'

                try {
                    return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, correctLogsArr[0].type,
                        correctLogsArr[0].date, correctLogsArr[1].date, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the parameters are incorrect (type is invalid)', () => {
            it('should throw a ValidationException', () => {
                correctLogsArr[0].child_id = '507f1f77bcf86cd799439011'

                try {
                    return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, otherIncorrectLog.type,
                        correctLogsArr[0].date, correctLogsArr[1].date, query)
                } catch (err) {
                    assert.propertyVal(err, 'message',
                        'The name of type provided "step" is not supported...')
                    assert.propertyVal(err, 'description',
                        'The names of the allowed types are: ' +
                        'steps, calories, active_minutes, lightly_active_minutes, sedentary_minutes.')
                }
            })
        })

        context('when the parameters are incorrect (dateStart is invalid)', () => {
            it('should throw a ValidationException', () => {
                correctLogsArr[0].date = '20199-03-18'

                try {
                    return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, correctLogsArr[0].type,
                        correctLogsArr[0].date, correctLogsArr[1].date, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Date parameter: 20199-03-18, is not in valid ISO 8601 format.')
                    assert.propertyVal(err, 'description', 'Date must be in the format: yyyy-MM-dd')
                }
            })
        })

        context('when the parameters are incorrect (dateEnd is invalid)', () => {
            it('should throw a ValidationException', () => {
                correctLogsArr[0].date = '2019-03-18'
                correctLogsArr[1].date = '20199-03-18'

                try {
                    return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, correctLogsArr[0].type,
                        correctLogsArr[0].date, correctLogsArr[1].date, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Date parameter: 20199-03-18, is not in valid ISO 8601 format.')
                    assert.propertyVal(err, 'description', 'Date must be in the format: yyyy-MM-dd')
                }
            })
        })

        context('when the parameters are invalid (date range is invalid)', () => {
            it('should throw a ValidationException', () => {

                try {
                    return logService.getByChildResourceAndDate(correctLogsArr[0].child_id, correctLogsArr[0].type,
                        '2018-03-18', '2019-03-27', query)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Date range is invalid...')
                    assert.propertyVal(err, 'description', 'Log dates range validation failed: ' +
                        'The period between the received dates is longer than one year')
                }
            })
        })
    })

    describe('countLogsByResource(childId: string, desiredResource: string, dateStart: string, dateEnd: string)', () => {
        context('when there is at least one log of the received type associated with the received child', () => {
            it('should return how many logs of the received type are associated with such child in the database', () => {
                return logService.countLogsByResource(correctLogsArr[0].child_id, correctLogsArr[0].type,
                    correctLogsArr[0].date, correctLogsArr[1].date)
                    .then(res => {
                        assert.equal(res, 1)
                    })
            })
        })
    })
})
