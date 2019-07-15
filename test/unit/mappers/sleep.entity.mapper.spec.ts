import { assert } from 'chai'
import { SleepEntityMapper } from '../../../src/infrastructure/entity/mapper/sleep.entity.mapper'
import { SleepMock } from '../../mocks/sleep.mock'
import { Sleep, SleepType } from '../../../src/application/domain/model/sleep'
import { SleepPatternDataSet } from '../../../src/application/domain/model/sleep.pattern.data.set'
import { SleepEntity } from '../../../src/infrastructure/entity/sleep.entity'

describe('Mappers: SleepEntityMapper', () => {
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
                start_time: '2018-08-18T01:40:30.000Z',
                name: 'restless',
                duration: 60000
            },
            {
                start_time: '2018-08-18T01:41:30.000Z',
                name: 'asleep',
                duration: 360000
            },
            {
                start_time: '2018-08-18T01:47:30.000Z',
                name: 'restless',
                duration: 240000
            }
        ],
        type: SleepType.CLASSIC
    }

    describe('transform(item: any)', () => {
        context('when the parameter is of type Sleep', () => {
            it('should normally execute the method, returning a SleepEntity as a result of the transformation', () => {
                const result: SleepEntity = new SleepEntityMapper().transform(sleep)
                assert.propertyVal(result, 'id', sleep.id)
                assert.propertyVal(result, 'start_time', sleep.start_time)
                assert.propertyVal(result, 'end_time', sleep.end_time)
                assert.propertyVal(result, 'duration', sleep.duration)
                assert.propertyVal(result, 'child_id', sleep.child_id)
                assert.propertyVal(result, 'type', sleep.type)
                assert.deepPropertyVal(result, 'pattern',
                    sleep.pattern!.data_set.map((elem: SleepPatternDataSet) => elem.toJSON()))
            })
        })

        context('when the parameter is a JSON', () => {
            it('should normally execute the method, returning a Sleep as a result of the transformation', () => {
                const result: Sleep = new SleepEntityMapper().transform(sleepJSON)
                assert.propertyVal(result, 'id', sleepJSON.id)
                assert.propertyVal(result, 'start_time', sleepJSON.start_time)
                assert.propertyVal(result, 'end_time', sleepJSON.end_time)
                assert.propertyVal(result, 'duration', sleepJSON.duration)
                assert.propertyVal(result, 'child_id', sleepJSON.child_id)
                assert.propertyVal(result, 'type', sleepJSON.type)
                assert.deepPropertyVal(result.pattern!.toJSON(), 'data_set', sleepJSON.pattern)
            })
        })

        context('when the parameter is an undefined', () => {
            it('should normally execute the method, returning an empty Sleep as a result of the transformation', () => {
                const result: Sleep = new SleepEntityMapper().transform(undefined)

                assert.isObject(result)
                assert.propertyVal(result, 'id', undefined)
            })
        })
    })
})
