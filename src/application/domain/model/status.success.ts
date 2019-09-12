import { IJSONSerializable } from '../utils/json.serializable.interface'

/**
 * Implementation of a class to represent the 'success' item of a MultiStatus
 *
 * @implements {IJSONSerializable}
 * @template T
 */
export class StatusSuccess<T> implements IJSONSerializable {
    private _code!: number
    private _item!: T

    constructor(code?: number, item?: T) {
        if (code) this.code = code
        if (item) this.item = item
    }

    get code(): number {
        return this._code
    }

    set code(value: number) {
        this._code = value
    }

    get item(): T {
        return this._item
    }

    set item(value: T) {
        this._item = value
    }

    public toJSON(): any {
        return {
            code: this.code,
            item: this.item
        }
    }

}
