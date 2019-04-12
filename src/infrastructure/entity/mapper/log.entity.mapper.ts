import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import {Log} from '../../../application/domain/model/log'
import { LogEntity } from '../log.entity'

@injectable()
export class LogEntityMapper implements IEntityMapper<Log, LogEntity> {

    public transform(item: any): any {
        if (item instanceof Log) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {Log} for {LogEntity}.
     *
     * @param item
     */
    public modelToModelEntity(item: Log): LogEntity {
        const result: LogEntity = new LogEntity()

        /**
         * Converts the log date to a valid format if necessary
         */
        if (item.date) {
            let dateSplit: Array<string>

            if (item.date.indexOf('-') > -1) dateSplit = item.date.split('-')
            else dateSplit = item.date.split('/')

            let month = dateSplit[1]

            let day = dateSplit[2]

            // Pass the month to the valid format
            if (month.length === 1) month = month.padStart(2, '0')

            // Pass the day to the valid format
            if (day.length === 1) day = day.padStart(2, '0')

            // Creates the log date with the same or new elements (if the month or day is in '1' format instead of '01')
            item.date = `${dateSplit[0]}-${month}-${day}`
        }

        if (item.id) result.id = item.id
        if (item.date) result.date = new Date((item.date).concat('T00:00:00'))
        if (item.value !== undefined) result.value = item.value
        if (item.type) result.type = item.type
        if (item.child_id) result.child_id = item.child_id

        return result
    }

    /**
     * Convert {LogEntity} for {Log}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param item
     */
    public modelEntityToModel(item: LogEntity): Log {
        throw Error('Not implemented!')
    }

    /**
     * Convert JSON for Log.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): Log {
        const result: Log = new Log()

        if (!json) return result
        if (json.id !== undefined) result.id = json.id
        if (json.date !== undefined) result.date = (json.date.toISOString()).substring(0, (json.date.toISOString()).indexOf('T'))
        if (json.value !== undefined) result.value = json.value
        if (json.type !== undefined) result.type = json.type
        if (json.child_id !== undefined) result.child_id = json.child_id

        return result
    }
}
