import { Log, LogType } from '../../../src/application/domain/model/log'
import { expect } from 'chai'
import HttpStatus from 'http-status-codes'
import { LogMock } from '../../mocks/log.mock'
import { Strings } from '../../../src/utils/strings'
import { LogRepoModel } from '../../../src/infrastructure/database/schema/log.schema'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Default } from '../../../src/utils/default'
import { LogEntityMapper } from '../../../src/infrastructure/entity/mapper/log.entity.mapper'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: children.logs', () => {
    /**
     * Mock objects for Log routes
     */
    let correctLogsArr: Array<Log> = new Array<Log>()
    correctLogsArr.push(new LogMock(LogType.STEPS))
    correctLogsArr.push(new LogMock(LogType.CALORIES))
    correctLogsArr.push(new LogMock(LogType.ACTIVE_MINUTES))
    correctLogsArr.push(new LogMock(LogType.LIGHTLY_ACTIVE_MINUTES))
    correctLogsArr.push(new LogMock(LogType.SEDENTARY_MINUTES))

    // Mock correct and incorrect logs array
    const mixedLogsArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < 3; i++) {
        mixedLogsArr.push(new LogMock())
    }

    // Mock other incorrect log with invalid date (invalid day)
    const incorrectLogJSON: any = {
        date: '2019-03-35',
        value: 1000
    }

    // Mock other incorrect log with invalid date
    const incorrectLogJSON2: any = {
        date: '20199-03-18',
        value: 1000
    }

    // Mock other incorrect log with negative value
    const incorrectLogJSON3: any = {
        date: '2019-03-18',
        value: -1000
    }

    // Mock other incorrect log with invalid value
    const incorrectLogJSON4: any = {
        date: '2019-03-18',
        value: 'invalid_value'
    }

    const incorrectLog: Log = new Log().fromJSON(incorrectLogJSON)
    const incorrectLog2: Log = new Log().fromJSON(incorrectLogJSON2)
    const incorrectLog3: Log = new Log().fromJSON(incorrectLogJSON3)
    const incorrectLog4: Log = new Log().fromJSON(incorrectLogJSON4)
    mixedLogsArr.push(incorrectLog)
    mixedLogsArr.push(incorrectLog2)
    mixedLogsArr.push(incorrectLog3)
    mixedLogsArr.push(incorrectLog4)

    // Start services
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)
            await deleteAllLogs()
        } catch (err) {
            throw new Error('Failure on children.logs routes test: ' + err.message)
        }
    })

    // Delete all log objects from the database
    after(async () => {
        try {
            await deleteAllLogs()
            await dbConnection.dispose()
        } catch (err) {
            throw new Error('Failure on children.logs routes test: ' + err.message)
        }
    })
    /**
     * POST route for Log
     */
    describe('POST /v1/children/:child_id/logs/:resource', () => {
        context('when all the logs in the body are correct and it still does not exist in the repository', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 207 and a response of type MultiStatus<Log> with the description of success in ' +
                'sending each log', () => {
                const body: any = []

                correctLogsArr.forEach(log => {
                    const bodyElem = {
                        date: log.date,
                        value: log.value
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${correctLogsArr[0].child_id}/logs/${LogType.STEPS}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when all the logs in the body are correct and already exist in the repository', () => {
            before(async () => {
                try {
                    await deleteAllLogs()

                    for (const log of correctLogsArr) {
                        await createLog({
                            type: log.type,
                            date: new Date(log.date),
                            value: log.value,
                            child_id: log.child_id
                        })
                    }
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 207, update the \'steps\' item value in the repository and ' +
                'return a response of type MultiStatus<Log> with the description of success in sending log', () => {
                const body: any = [{
                    date: correctLogsArr[0].date,
                    value: correctLogsArr[0].value
                }]

                request
                    .post(`/v1/children/${correctLogsArr[0].child_id}/logs/${correctLogsArr[0].type}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        expect(res.body.success[0].code).to.eql(HttpStatus.CREATED)
                        expect(res.body.success[0].item.date).to.eql(correctLogsArr[0].date)
                        expect(res.body.success[0].item.value).to.eql(correctLogsArr[0].value)
                        expect(res.body.error.length).to.eql(0)
                    })
            })

            it('should return status code 207, update the \'calories\' item value in the repository and ' +
                'return a response of type MultiStatus<Log> with the description of success in sending log', () => {
                const body: any = [{
                    date: correctLogsArr[1].date,
                    value: correctLogsArr[1].value
                }]

                request
                    .post(`/v1/children/${correctLogsArr[1].child_id}/logs/${correctLogsArr[1].type}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        expect(res.body.success[0].code).to.eql(HttpStatus.CREATED)
                        expect(res.body.success[0].item.date).to.eql(correctLogsArr[1].date)
                        expect(res.body.success[0].item.value).to.eql(correctLogsArr[1].value)
                        expect(res.body.error.length).to.eql(0)
                    })
            })

            it('should return status code 207, update the \'active_minutes\' item value in the repository and ' +
                'return a response of type MultiStatus<Log> with the description of success in sending log', () => {
                const body: any = [{
                    date: correctLogsArr[2].date,
                    value: correctLogsArr[2].value
                }]

                request
                    .post(`/v1/children/${correctLogsArr[2].child_id}/logs/${correctLogsArr[2].type}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        expect(res.body.success[0].code).to.eql(HttpStatus.CREATED)
                        expect(res.body.success[0].item.date).to.eql(correctLogsArr[2].date)
                        expect(res.body.success[0].item.value).to.eql(correctLogsArr[2].value)
                        expect(res.body.error.length).to.eql(0)
                    })
            })

            it('should return status code 207, update the \'lightly_active_minutes\' item value in the repository ' +
                'and return a response of type MultiStatus<Log> with the description of success in sending log', () => {
                const body: any = [{
                    date: correctLogsArr[3].date,
                    value: correctLogsArr[3].value
                }]

                request
                    .post(`/v1/children/${correctLogsArr[3].child_id}/logs/${correctLogsArr[3].type}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        expect(res.body.success[0].code).to.eql(HttpStatus.CREATED)
                        expect(res.body.success[0].item.date).to.eql(correctLogsArr[3].date)
                        expect(res.body.success[0].item.value).to.eql(correctLogsArr[3].value)
                        expect(res.body.error.length).to.eql(0)
                    })
            })

            it('should return status code 207, update the \'sedentary_minutes\' item value in the repository and ' +
                'return a response of type MultiStatus<Log> with the description of success in sending log', () => {
                const body: any = [{
                    date: correctLogsArr[4].date,
                    value: correctLogsArr[4].value
                }]

                request
                    .post(`/v1/children/${correctLogsArr[4].child_id}/logs/${correctLogsArr[4].type}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        expect(res.body.success[0].code).to.eql(HttpStatus.CREATED)
                        expect(res.body.success[0].item.date).to.eql(correctLogsArr[4].date)
                        expect(res.body.success[0].item.value).to.eql(correctLogsArr[4].value)
                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when all the logs in the body are correct and have the same date', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 207, create or update (if already exists) the first element, update its value ' +
                'with the value of the next logs and return a response of type MultiStatus<Log> with the description of success ' +
                'in sending each log', () => {
                const body: any = []

                correctLogsArr.forEach(log => {
                    log.date = '2019-04-15'
                })

                correctLogsArr.forEach(log => {
                    const bodyElem = {
                        date: log.date,
                        value: log.value
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${correctLogsArr[0].child_id}/logs/${LogType.STEPS}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when all the logs in the body are correct and some of them already exist in the repository', () => {
            before(async () => {
                try {
                    await deleteAllLogs()

                    await createLog({
                        type: correctLogsArr[0].type,
                        date: new Date(correctLogsArr[0].date),
                        value: correctLogsArr[0].value,
                        child_id: correctLogsArr[0].child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 207, update the value of the items already in the repository, create the new ones, ' +
                'and return a response of type MultiStatus<Log> with the description of success in sending each log', () => {
                const newLog: Log = new LogMock()
                newLog.date = '2019-10-02'
                correctLogsArr.push(newLog)

                const body: any = []

                correctLogsArr.forEach(log => {
                    const bodyElem = {
                        date: log.date,
                        value: log.value
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${correctLogsArr[0].child_id}/logs/${correctLogsArr[0].type}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when some of the logs in the body are incorrect (the date and value are invalid)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 207, perform the operations of creating and updating normally for the correct logs ' +
                'and returning a response of type MultiStatus<Log> with the description of success and error cases of each log',
                () => {
                    const body: any = []

                    mixedLogsArr.forEach(log => {
                        const bodyElem = {
                            date: log.date,
                            value: log.value
                        }
                        body.push(bodyElem)
                    })

                    return request
                        .post(`/v1/children/${mixedLogsArr[0].child_id}/logs/${LogType.STEPS}`)
                        .send(body)
                        .set('Content-Type', 'application/json')
                        .expect(207)
                        .then(res => {
                            for (let i = 0; i < res.body.success.length; i++) {
                                expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                                expect(res.body.success[i].item.date).to.eql(mixedLogsArr[i].date)
                                expect(res.body.success[i].item.value).to.eql(mixedLogsArr[i].value)
                            }

                            expect(res.body.error[0].message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT.
                            replace('{0}', '2019-03-35'))
                            expect(res.body.error[1].message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT.
                            replace('{0}', '20199-03-18'))
                            expect(res.body.error[1].description).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT_DESC)
                            expect(res.body.error[2].message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                            expect(res.body.error[2].description).to.eql('value'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                            expect(res.body.error[3].message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                            expect(res.body.error[3].description).to.eql('value'.concat(Strings.ERROR_MESSAGE.INVALID_NUMBER))

                            for (let i = 0; i < res.body.error.length; i++) {
                                expect(res.body.error[i].code).to.eql(HttpStatus.BAD_REQUEST)
                                expect(res.body.error[i].item.date).to.eql(mixedLogsArr[i + 3].date)
                                expect(res.body.error[i].item.value).to.eql(mixedLogsArr[i + 3].value)
                            }
                        })
                })
        })

        context('when some of the logs in the body are incorrect (the child_id is invalid)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 207, perform the operations of creating and updating normally for the correct logs ' +
                'and returning a response of type MultiStatus<Log> with the description of success and error cases of each log',
                () => {
                    const body: any = []

                    correctLogsArr.forEach(log => {
                        const bodyElem = {
                            date: log.date,
                            value: log.value
                        }
                        body.push(bodyElem)
                    })

                    return request
                        .post(`/v1/children/123/logs/${LogType.STEPS}`)
                        .send(body)
                        .set('Content-Type', 'application/json')
                        .expect(207)
                        .then(res => {
                            expect(res.body.success.length).to.eql(0)
                            for (let i = 0; i < res.body.error.length; i++) {
                                expect(res.body.error[i].code).to.eql(HttpStatus.BAD_REQUEST)
                                expect(res.body.error[i].message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                                expect(res.body.error[i].description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                                expect(res.body.error[i].item.date).to.eql(correctLogsArr[i].date)
                                expect(res.body.error[i].item.value).to.eql(correctLogsArr[i].value)
                            }
                        })
                })
        })

        context('when some of the logs in the body are incorrect (the type is invalid)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 207, perform the operations of creating and updating normally for the correct logs ' +
                'and returning a response of type MultiStatus<Log> with the description of success and error cases of each log',
                () => {
                    const body: any = []

                    correctLogsArr.forEach(log => {
                        const bodyElem = {
                            date: log.date,
                            value: log.value
                        }
                        body.push(bodyElem)
                    })

                    return request
                        .post(`/v1/children/${correctLogsArr[0].child_id}/logs/step`)
                        .send(body)
                        .set('Content-Type', 'application/json')
                        .expect(207)
                        .then(res => {
                            expect(res.body.success.length).to.eql(0)
                            for (let i = 0; i < res.body.error.length; i++) {
                                expect(res.body.error[i].code).to.eql(HttpStatus.BAD_REQUEST)
                                expect(res.body.error[i].message)
                                    .to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                                expect(res.body.error[i].description)
                                    .to.eql('The names of the allowed types are: ' +
                                    'steps, calories, active_minutes, lightly_active_minutes, sedentary_minutes.')
                                expect(res.body.error[i].item.date).to.eql(correctLogsArr[i].date)
                                expect(res.body.error[i].item.value).to.eql(correctLogsArr[i].value)
                            }
                        })
                })
        })

        context('when some of the logs in the array are incorrect (missing fields)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 207, perform the operations of creating and updating normally for the correct logs ' +
                'and returning a response of type MultiStatus<Log> with the description of success and error cases of each log',
                () => {
                    const emptyLog: Log = new Log()
                    correctLogsArr.push(emptyLog)

                    const body: any = []

                    correctLogsArr.forEach(log => {
                        const bodyElem = {
                            date: log.date,
                            value: log.value
                        }
                        body.push(bodyElem)
                    })

                    return request
                        .post(`/v1/children/${correctLogsArr[0].child_id}/logs/${LogType.CALORIES}`)
                        .send(body)
                        .set('Content-Type', 'application/json')
                        .expect(207)
                        .then(res => {
                            for (let i = 0; i < res.body.success.length; i++) {
                                expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                                expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                                expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                            }
                            expect(res.body.error[0].code).to.eql(HttpStatus.BAD_REQUEST)
                            expect(res.body.error[0].message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                            expect(res.body.error[0].description).to.eql('date, value'
                                .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                        })
                })
        })
    })
    /**
     * GET route for Log
     */
    describe('GET /v1/children/:child_id/logs/date/:date_start/:date_end', () => {
        before(() => {
            correctLogsArr = new Array<Log>()
            correctLogsArr.push(new LogMock(LogType.STEPS))
            correctLogsArr.push(new LogMock(LogType.CALORIES))
            correctLogsArr.push(new LogMock(LogType.ACTIVE_MINUTES))
            correctLogsArr.push(new LogMock(LogType.LIGHTLY_ACTIVE_MINUTES))
            correctLogsArr.push(new LogMock(LogType.SEDENTARY_MINUTES))
        })
        context('when the parameters are correct and there are corresponding logs with the query', () => {
            before(async () => {
                try {
                    await deleteAllLogs()

                    for (const log of correctLogsArr) {
                        await createLog({
                            type: log.type,
                            date: new Date(log.date),
                            value: log.value,
                            child_id: log.child_id
                        })
                    }
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 200 and a ChildLog with the log arrays', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.steps[0].date).to.be.eql(correctLogsArr[0].date)
                        expect(res.body.steps[0].value).to.be.eql(correctLogsArr[0].value)
                        expect(res.body.calories[0].date).to.be.eql(correctLogsArr[1].date)
                        expect(res.body.calories[0].value).to.be.eql(correctLogsArr[1].value)
                        expect(res.body.active_minutes[0].date).to.be.eql(correctLogsArr[2].date)
                        expect(res.body.active_minutes[0].value).to.be.eql(correctLogsArr[2].value)
                        expect(res.body.lightly_active_minutes[0].date).to.be.eql(correctLogsArr[3].date)
                        expect(res.body.lightly_active_minutes[0].value).to.be.eql(correctLogsArr[3].value)
                        expect(res.body.sedentary_minutes[0].date).to.be.eql(correctLogsArr[4].date)
                        expect(res.body.sedentary_minutes[0].value).to.be.eql(correctLogsArr[4].value)
                    })
            })
        })

        context('when the parameters are correct but there are no corresponding logs with the query', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 200 and an empty ChildLog', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs`
                const specificPath = `/date/2005-10-01/2005-10-10`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.steps.length).to.eql(10)
                        expect(res.body.calories.length).to.eql(10)
                        expect(res.body.active_minutes.length).to.eql(10)
                        expect(res.body.lightly_active_minutes.length).to.eql(10)
                        expect(res.body.sedentary_minutes.length).to.eql(10)
                    })
            })
        })

        context('when the parameters are incorrect (child_id is invalid)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid child_id', () => {
                const basePath = `/v1/children/123/logs`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the parameters are incorrect (date_start is invalid)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid date_start', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs`
                const specificPath = `/date/20199-10-01/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT.
                        replace('{0}', '20199-10-01'))
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT_DESC)
                    })
            })
        })

        context('when the parameters are incorrect (date_end is invalid)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid date_end', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs`
                const specificPath = `/date/${correctLogsArr[0].date}/20199-10-01`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT.
                        replace('{0}', '20199-10-01'))
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT_DESC)
                    })
            })
        })

        context('when the parameters are incorrect (date_end with an invalid day)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid date_end', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs`
                const specificPath = `/date/${correctLogsArr[0].date}/2019-10-35`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT.
                        replace('{0}', '2019-10-35'))
                    })
            })
        })

        context('when the parameters are invalid (date range is invalid (period longer than 1 year and 5 days))', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid date_end', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs`
                const specificPath = `/date/2018-03-18/2019-03-27`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.DATE_RANGE_INVALID
                            .replace('{0}', '2018-03-18').replace('{1}', '2019-03-27'))
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.DATE_RANGE_EXCEED_YEAR_DESC)
                    })
            })
        })

        context('when the parameters are invalid (date range is invalid (date_end has an older date than date_start))', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid date_end', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs`
                const specificPath = `/date/2018-03-18/2017-03-27`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.DATE_RANGE_INVALID
                            .replace('{0}', '2018-03-18').replace('{1}', '2017-03-27'))
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.DATE_RANGE_INVALID_DESC)
                    })
            })
        })
    })
    /**
     * GET route for Log by resource
     */
    describe('GET /v1/children/:child_id/logs/:resource/date/:date_start/:date_end', () => {
        context('when the parameters are correct and there are corresponding logs with the query', () => {
            before(async () => {
                try {
                    await deleteAllLogs()

                    for (const log of correctLogsArr) {
                        await createLog({
                            type: log.type,
                            date: new Date(log.date),
                            value: log.value,
                            child_id: log.child_id
                        })
                    }
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 200 and an array of steps logs', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body[0].date).to.be.eql(correctLogsArr[0].date)
                        expect(res.body[0].value).to.be.eql(correctLogsArr[0].value)
                    })
            })

            it('should return status code 200 and an array of calories logs', () => {
                const basePath = `/v1/children/${correctLogsArr[1].child_id}/logs/${correctLogsArr[1].type}`
                const specificPath = `/date/${correctLogsArr[1].date}/${correctLogsArr[1].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body[0].date).to.be.eql(correctLogsArr[1].date)
                        expect(res.body[0].value).to.be.eql(correctLogsArr[1].value)
                    })
            })

            it('should return status code 200 and an array of active_minutes logs', () => {
                const basePath = `/v1/children/${correctLogsArr[2].child_id}/logs/${correctLogsArr[2].type}`
                const specificPath = `/date/${correctLogsArr[2].date}/${correctLogsArr[2].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body[0].date).to.be.eql(correctLogsArr[2].date)
                        expect(res.body[0].value).to.be.eql(correctLogsArr[2].value)
                    })
            })

            it('should return status code 200 and an array of lightly_active_minutes logs', () => {
                const basePath = `/v1/children/${correctLogsArr[3].child_id}/logs/${correctLogsArr[3].type}`
                const specificPath = `/date/${correctLogsArr[3].date}/${correctLogsArr[3].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body[0].date).to.be.eql(correctLogsArr[3].date)
                        expect(res.body[0].value).to.be.eql(correctLogsArr[3].value)
                    })
            })

            it('should return status code 200 and an array of sedentary_minutes logs', () => {
                const basePath = `/v1/children/${correctLogsArr[4].child_id}/logs/${correctLogsArr[4].type}`
                const specificPath = `/date/${correctLogsArr[4].date}/${correctLogsArr[4].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body[0].date).to.be.eql(correctLogsArr[4].date)
                        expect(res.body[0].value).to.be.eql(correctLogsArr[4].value)
                    })
            })
        })

        context('when the parameters are correct but there are no corresponding logs with the query', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 200 and an empty array of logs', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/2005-10-01/2005-10-10`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(10)
                    })
            })
        })

        context('when the parameters are incorrect (child_id is invalid)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid child_id', () => {
                const basePath = `/v1/children/123/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the parameters are incorrect (resource is invalid)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid resource', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs/step`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description)
                            .to.eql('The names of the allowed types are: ' +
                            'steps, calories, active_minutes, lightly_active_minutes, sedentary_minutes.')
                    })
            })
        })

        context('when the parameters are incorrect (date_start is invalid)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid date_start', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/20199-10-01/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT.
                        replace('{0}', '20199-10-01'))
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT_DESC)
                    })
            })
        })

        context('when the parameters are incorrect (date_start with an invalid day)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid date_start', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/2019-10-35/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT.
                        replace('{0}', '2019-10-35'))
                    })
            })
        })

        context('when the parameters are incorrect (date_end is invalid)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid date_end', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/${correctLogsArr[0].date}/20199-10-01`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT.
                        replace('{0}', '20199-10-01'))
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT_DESC)
                    })
            })
        })

        context('when the parameters are invalid (date range is invalid)', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on children.logs routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid date_end', () => {
                const basePath = `/v1/children/${correctLogsArr[0].child_id}/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/2018-03-18/2019-03-27`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.DATE_RANGE_INVALID
                            .replace('{0}', '2018-03-18').replace('{1}', '2019-03-27'))
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.DATE_RANGE_EXCEED_YEAR_DESC)
                    })
            })
        })
    })
})

async function createLog(item): Promise<any> {
    const logMapper: LogEntityMapper = new LogEntityMapper()
    const resultModel = logMapper.transform(item)
    const resultModelEntity = logMapper.transform(resultModel)
    return Promise.resolve(LogRepoModel.create(resultModelEntity))
}

async function deleteAllLogs() {
    return LogRepoModel.deleteMany({})
}
