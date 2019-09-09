import { IJSONSerializable } from '../utils/json.serializable.interface'
import { StatusSuccess } from './status.success'
import { StatusError } from './status.error'

/**
 * Implementation of a class to represent the MultiStatus model of response
 *
 * @implements {IJSONSerializable, IJSONDeserializable}
 * @template T
 */
export class MultiStatus<T> implements IJSONSerializable {
    private _success!: Array<StatusSuccess<T>>
    private _error!: Array<StatusError<T>>

    constructor(success?: Array<StatusSuccess<T>>, error?: Array<StatusError<T>>) {
        if (success) this.success = success
        if (error) this.error = error
    }

    get success(): Array<StatusSuccess<T>> {
        return this._success
    }

    set success(value: Array<StatusSuccess<T>>) {
        this._success = value
    }

    get error(): Array<StatusError<T>> {
        return this._error
    }

    set error(value: Array<StatusError<T>>) {
        this._error = value
    }

    public toJSON(): any {
        return {
            success: this.success ? this.success.map(item => item.toJSON()) : this.success,
            error: this.error ? this.error.map(item => item.toJSON()) : this.error
        }
    }

}
