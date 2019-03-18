import HttpStatus from 'http-status-codes'
import { MultiStatus } from '../../src/application/domain/model/multi.status'
import { Log } from '../../src/application/domain/model/log'
import { CreateLogValidator } from '../../src/application/domain/validator/create.log.validator'
import { StatusSuccess } from '../../src/application/domain/model/status.success'
import { StatusError } from '../../src/application/domain/model/status.error'
import { ValidationException } from '../../src/application/domain/exception/validation.exception'
import { ConflictException } from '../../src/application/domain/exception/conflict.exception'

export class MultiStatusMock extends MultiStatus<Log> {

    public static generateMultiStatus(logsArr: Array<Log>): MultiStatus<Log> {
        const multiStatus: MultiStatus<Log> = new MultiStatus<Log>()
        const statusSuccessArr: Array<StatusSuccess<Log>> = new Array<StatusSuccess<Log>>()
        const statusErrorArr: Array<StatusError<Log>> = new Array<StatusError<Log>>()

        logsArr.forEach(elem => {
            try {
                CreateLogValidator.validate(elem)
                // 1a. Create a StatusSuccess object for the construction of the MultiStatus response.
                const statusSuccess: StatusSuccess<Log> = new StatusSuccess<Log>(HttpStatus.CREATED, elem)
                statusSuccessArr.push(statusSuccess)
            } catch (err) {
                let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST
                if (err instanceof ConflictException) statusCode = HttpStatus.CONFLICT

                // 1b. Create a StatusError object for the construction of the MultiStatus response.
                const statusError: StatusError<Log> = new StatusError<Log>(statusCode, err.message, err.description, elem)
                statusErrorArr.push(statusError)
            }
        })

        // 2. Build the MultiStatus response.
        multiStatus.success = statusSuccessArr
        multiStatus.error = statusErrorArr

        return multiStatus
    }
}
