import { assert } from 'chai'
import { PhysicalActivityEntityMapper } from '../../../src/infrastructure/entity/mapper/physical.activity.entity.mapper'
import { Log, LogType } from '../../../src/application/domain/model/log'
import { PhysicalActivityLog } from '../../../src/application/domain/model/physical.activity.log'
import { PhysicalActivityLogEntityMapper } from '../../../src/infrastructure/entity/mapper/physical.activity.log.entity.mapper'

describe('Mappers: PhysicalActivityLogEntity', () => {
    const activityLog: PhysicalActivityLog = new PhysicalActivityLog()
    activityLog.id = '5a62be07de34500146d9c544'
    activityLog.steps = [new Log('2019-03-11', 1000, LogType.STEPS, '5a62be07de34500146d9c544'),
                         new Log('2019-03-12', 800, LogType.STEPS, '5a62be07de34500146d9c544'),
                         new Log('2019-03-13', 900, LogType.STEPS, '5a62be07de34500146d9c544')]
    activityLog.calories = [new Log('2019-03-11', 500, LogType.CALORIES, '5a62be07de34500146d9c544'),
                            new Log('2019-03-12', 400, LogType.CALORIES, '5a62be07de34500146d9c544'),
                            new Log('2019-03-13', 600, LogType.CALORIES, '5a62be07de34500146d9c544')]

    // Create physical activity log JSON
    const activityLogJSON: any = {
        id: '5a62be07de34500146d9c544',
        steps: activityLog.steps,
        calories: activityLog.calories
    }

    describe('transform(item: any)', () => {
        context('when the parameter is of type PhysicalActivityLog', () => {
            it('should normally execute the method, returning a PhysicalActivityLogEntity as a result of the transformation', () => {
                const result = new PhysicalActivityLogEntityMapper().transform(activityLog)
                assert.propertyVal(result, 'id', activityLog.id)
                assert(result.steps, 'steps must not be undefined')
                assert(result.calories, 'calories must not be undefined')
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning a PhysicalActivityLog as a result of the transformation', () => {
                const result = new PhysicalActivityEntityMapper().transform(activityLogJSON)
                assert.propertyVal(result, 'id', activityLogJSON.id)
                assert.propertyVal(result, 'steps', activityLogJSON.steps)
                assert.propertyVal(result, 'calories', activityLogJSON.calories)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning an empty PhysicalActivityLog as a result of the transformation', () => {
                const result = new PhysicalActivityLogEntityMapper().transform(undefined)

                assert.isObject(result)
                assert.propertyVal(result, 'id', undefined)
            })
        })
    })
})
