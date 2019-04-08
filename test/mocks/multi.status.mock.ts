import HttpStatus from 'http-status-codes'
import { MultiStatus } from '../../src/application/domain/model/multi.status'
import { CreateLogValidator } from '../../src/application/domain/validator/create.log.validator'
import { StatusSuccess } from '../../src/application/domain/model/status.success'
import { StatusError } from '../../src/application/domain/model/status.error'
import { ValidationException } from '../../src/application/domain/exception/validation.exception'
import { ConflictException } from '../../src/application/domain/exception/conflict.exception'
import { Environment } from '../../src/application/domain/model/environment'
import { Log } from '../../src/application/domain/model/log'
import { CreateEnvironmentValidator } from '../../src/application/domain/validator/create.environment.validator'

export class MultiStatusMock<T> extends MultiStatus<Log | Environment> {

    public generateMultiStatus(itemsArr: Array<T>): MultiStatus<T> {
        const multiStatus: MultiStatus<T> = new MultiStatus<T>()
        const statusSuccessArr: Array<StatusSuccess<T>> = new Array<StatusSuccess<T>>()
        const statusErrorArr: Array<StatusError<T>> = new Array<StatusError<T>>()

        itemsArr.forEach(elem => {
            try {
                if (elem instanceof Log) CreateLogValidator.validate(elem)
                else if (elem instanceof Environment) CreateEnvironmentValidator.validate(elem)
                // 1a. Create a StatusSuccess object for the construction of the MultiStatus response.
                const statusSuccess: StatusSuccess<T> = new StatusSuccess<T>(HttpStatus.CREATED, elem)
                statusSuccessArr.push(statusSuccess)
            } catch (err) {
                let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
                if (err instanceof ValidationException) statusCode = HttpStatus.BAD_REQUEST
                if (err instanceof ConflictException) statusCode = HttpStatus.CONFLICT

                // 1b. Create a StatusError object for the construction of the MultiStatus response.
                const statusError: StatusError<T> = new StatusError<T>(statusCode, err.message, err.description, elem)
                statusErrorArr.push(statusError)
            }
        })

        // 2. Build the MultiStatus response.
        multiStatus.success = statusSuccessArr
        multiStatus.error = statusErrorArr

        return multiStatus
    }
}
