import { assert } from 'chai'
import { Sleep } from '../../../src/application/domain/model/sleep'
import { SleepEntityMapper } from '../../../src/infrastructure/entity/mapper/sleep.entity.mapper'
import { SleepPattern, SleepPatternType } from '../../../src/application/domain/model/sleep.pattern'
import { SleepPatternDataSet } from '../../../src/application/domain/model/sleep.pattern.data.set'

describe('Mappers: SleepEntity', () => {
    const sleep: Sleep = new Sleep()
    sleep.id = '5a62be07de34500146d9c544'
    sleep.start_time = new Date('2018-08-18T01:40:30Z')
    sleep.end_time = new Date('2018-08-18T09:52:30Z')
    sleep.duration = 29520000
    sleep.child_id = '5a62be07de34500146d9c544'
    /**
     * Create SleepPattern for sleep
     */
    sleep.pattern = new SleepPattern()
    const dataSet: Array<SleepPatternDataSet> = []

    const dataSetItem: SleepPatternDataSet = new SleepPatternDataSet()
    dataSetItem.start_time = new Date(sleep.start_time)
    dataSetItem.name = SleepPatternType.RESTLESS
    dataSetItem.duration = Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min milliseconds

    const dataSetItem2: SleepPatternDataSet = new SleepPatternDataSet()
    dataSetItem2.start_time = new Date('2018-08-18T01:45:30Z')
    dataSetItem2.name = SleepPatternType.AWAKE
    dataSetItem2.duration = Math.floor(Math.random() * 3 + 1) * 60000 // 1-3min in milliseconds

    const dataSetItem3: SleepPatternDataSet = new SleepPatternDataSet()
    dataSetItem3.start_time = new Date('2018-08-18T02:45:30Z')
    dataSetItem3.name = SleepPatternType.ASLEEP
    dataSetItem3.duration = Math.floor(Math.random() * 120 + 1) * 60000 // 1-180min in milliseconds

    dataSet.push(dataSetItem)
    dataSet.push(dataSetItem2)
    dataSet.push(dataSetItem3)

    sleep.pattern.data_set = dataSet

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
        },
        {
            start_time: '2018-08-18T01:51:30.00Z',
            name: 'asleep',
            duration: 60000
        },
        {
            start_time: '2018-08-18T01:52:30.00Z',
            name: 'restless',
            duration: 60000
        },
        {
            start_time: '2018-08-18T01:53:30.00Z',
            name: 'asleep',
            duration: 2100000
        },
        {
            start_time: '2018-08-18T02:28:30.00Z',
            name: 'restless',
            duration: 240000
        },
        {
            start_time: '2018-08-18T02:32:30.00Z',
            name: 'awake',
            duration: 180000
        },
        {
            start_time: '2018-08-18T02:35:30.00Z',
            name: 'asleep',
            duration: 15120000
        },
        {
            start_time: '2018-08-18T06:47:30.00Z',
            name: 'restless',
            duration: 60000
        },
        {
            start_time: '2018-08-18T06:48:30.00Z',
            name: 'asleep',
            duration: 2580000
        },
        {
            start_time: '2018-08-18T07:31:30.00Z',
            name: 'restless',
            duration: 120000
        },
        {
            start_time: '2018-08-18T07:33:30.00Z',
            name: 'asleep',
            duration: 120000
        },
        {
            start_time: '2018-08-18T07:35:30.00Z',
            name: 'restless',
            duration: 60000
        },
        {
            start_time: '2018-08-18T07:36:30.00Z',
            name: 'asleep',
            duration: 1200000
        },
        {
            start_time: '2018-08-18T07:56:30.00Z',
            name: 'restless',
            duration: 60000
        },
        {
            start_time: '2018-08-18T07:57:30.00Z',
            name: 'asleep',
            duration: 2580000
        },
        {
            start_time: '2018-08-18T08:40:30.00Z',
            name: 'restless',
            duration: 180000
        },
        {
            start_time: '2018-08-18T08:43:30.00Z',
            name: 'asleep',
            duration: 1200000
        },
        {
            start_time: '2018-08-18T09:03:30.00Z',
            name: 'restless',
            duration: 60000
        },
        {
            start_time: '2018-08-18T09:04:30.00Z',
            name: 'asleep',
            duration: 1740000
        },
        {
            start_time: '2018-08-18T09:03:30.00Z',
            name: 'restless',
            duration: 180000
        },
        {
            start_time: '2018-08-18T09:36:30.00Z',
            name: 'asleep',
            duration: 960000
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
            it('should not normally execute the method, returning a JSON as a result of the transformation', () => {
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
    })
})
