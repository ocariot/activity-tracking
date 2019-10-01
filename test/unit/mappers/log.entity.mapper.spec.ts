import { assert } from 'chai'
import { Log, LogType } from '../../../src/application/domain/model/log'
import { LogEntityMapper } from '../../../src/infrastructure/entity/mapper/log.entity.mapper'
import { LogEntity } from '../../../src/infrastructure/entity/log.entity'

describe('Mappers: LogEntityMapper', () => {
    const log: Log = new Log('2019/3/1', 1000, LogType.CALORIES, '5a62be07de34500146d9c544')
    log.id = '5a62be07de34500146d9c544'

    // To test how mapper works with an object without any attributes
    const emptyLog: Log = new Log()

    // Create log JSON
    const logJSON: any = {
        id: '5a62be07de34500146d9c544',
        date: new Date('2019-03-11'),
        value: 1000,
        type: LogType.CALORIES,
        child_id: '5a62be07de34500146d9c544'
    }

    // To test how mapper works with an object without any attributes (JSON)
    const emptyLogJSON: any = {}

    describe('transform(item: any)', () => {
        context('when the parameter is of type Log', () => {
            it('should normally execute the method, returning a LogEntity as a result of the transformation', () => {
                const result: LogEntity = new LogEntityMapper().transform(log)
                assert.propertyVal(result, 'id', log.id)
                assert.equal((result.date!.toISOString()).substring(0, (result.date!.toISOString()).indexOf('T')), log.date)
                assert.propertyVal(result, 'value', log.value)
                assert.propertyVal(result, 'type', log.type)
                assert.propertyVal(result, 'child_id', log.child_id)
            })
        })

        context('when the parameter is of type Log and does not contain any attributes', () => {
            it('should normally execute the method, returning an empty LogEntity', () => {
                const result: LogEntity = new LogEntityMapper().transform(emptyLog)
                assert.isEmpty(result)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should normally execute the method, returning a Log as a result of the transformation', () => {
                const result: Log = new LogEntityMapper().transform(logJSON)
                assert.propertyVal(result, 'id', logJSON.id)
                assert.propertyVal(result, 'date', (logJSON.date.toISOString()).substring(0, (logJSON.date.toISOString()).indexOf('T')))
                assert.propertyVal(result, 'value', logJSON.value)
                assert.propertyVal(result, 'type', logJSON.type)
                assert.propertyVal(result, 'child_id', logJSON.child_id)
            })
        })

        context('when the parameter is a JSON and does not contain any attributes', () => {
            it('should normally execute the method, returning a Log as a result of the transformation', () => {
                const result: Log = new LogEntityMapper().transform(emptyLogJSON)
                assert.propertyVal(result, 'id', emptyLogJSON.id)
                assert.propertyVal(result, 'date', emptyLogJSON.date)
                assert.propertyVal(result, 'value', emptyLogJSON.value)
                assert.propertyVal(result, 'type', emptyLogJSON.type)
                assert.propertyVal(result, 'child_id', emptyLogJSON.child_id)
            })
        })

        context('when the parameter is an undefined', () => {
            it('should normally execute the method, returning an empty Log as a result of the transformation', () => {
                const result: Log = new LogEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'date', undefined)
                assert.propertyVal(result, 'value', undefined)
                assert.propertyVal(result, 'type', undefined)
                assert.propertyVal(result, 'child_id', undefined)
            })
        })
    })
})
