import { assert } from 'chai'
import { SleepEntityMapper } from '../../../src/infrastructure/entity/mapper/sleep.entity.mapper'
import { SleepMock } from '../../mocks/sleep.mock'

describe('Mappers: SleepEntity', () => {
    const sleep: SleepMock = new SleepMock()

    // Create sleep JSON
    const sleepJSON: any = {
        id: '5a62be07de34500146d9c544',
        start_time: new Date('2018-08-18T01:40:30Z').toISOString(),
        end_time: new Date('2018-08-18T09:52:30Z').toISOString(),
        duration: 29520000,
        child_id: '5a62be07de34500146d9c544',
        pattern: [
            {
                start_time: '2018-08-18T01:40:30.00Z',
                name: 'restless',
                duration: 60000
            },
            {
                start_time: '2018-08-18T01:41:30.00Z',
                name: 'asleep',
                duration: 360000
            },
            {
                start_time: '2018-08-18T01:47:30.00Z',
                name: 'restless',
                duration: 240000
            }
    ]
    }

    describe('transform(item: any)', () => {
        context('when the parameter is of type Sleep', () => {
            it('should normally execute the method, returning a SleepEntity as a result of the transformation', () => {
                const result = new SleepEntityMapper().transform(sleep)
                assert(result.id, 'Sleep id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', sleep.id)
                assert(result.start_time, 'start_time must not be undefined')
                assert.propertyVal(result, 'start_time', sleep.start_time)
                assert(result.end_time, 'end_time must not be undefined')
                assert.propertyVal(result, 'end_time', sleep.end_time)
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', sleep.duration)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', sleep.child_id)
                assert(result.pattern, 'pattern must not be undefined')
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning a Sleep as a result of the transformation', () => {
                const result = new SleepEntityMapper().transform(sleepJSON)
                assert(result.id, 'Sleep id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', sleepJSON.id)
                assert(result.start_time, 'start_time must not be undefined')
                assert.propertyVal(result, 'start_time', sleepJSON.start_time)
                assert(result.end_time, 'end_time must not be undefined')
                assert.propertyVal(result, 'end_time', sleepJSON.end_time)
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', sleepJSON.duration)
                assert(result.child_id, 'child_id must not be undefined')
                assert.propertyVal(result, 'child_id', sleepJSON.child_id)
                assert(result.pattern, 'pattern must not be undefined')
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning an empty Sleep as a result of the transformation', () => {
                const result = new SleepEntityMapper().transform(undefined)

                assert.isObject(result)
                assert.propertyVal(result, 'id', undefined)
            })
        })
    })
})
