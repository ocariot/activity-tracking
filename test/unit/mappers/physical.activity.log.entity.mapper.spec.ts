import { assert } from 'chai'
import { PhysicalActivityLog } from '../../../src/application/domain/model/physical.activity.log'
import { PhysicalActivityLogEntityMapper } from '../../../src/infrastructure/entity/mapper/physical.activity.log.entity.mapper'
import { PhysicalActivityLogEntity } from '../../../src/infrastructure/entity/physical.activity.log.entity'
import { PhysicalActivityLogMock } from '../../mocks/physical.activity.log.mock'

describe('Mappers: PhysicalActivityLogEntityMapper', () => {
    const activityLog: PhysicalActivityLog = new PhysicalActivityLogMock()

    // Create physical activity log JSON
    const activityLogJSON: any = {
        id: '5a62be07de34500146d9c544',
        steps: activityLog.steps,
        calories: activityLog.calories,
        active_minutes: activityLog.active_minutes,
        sedentary_minutes: activityLog.sedentary_minutes
    }

    describe('transform(item: any)', () => {
        context('when the parameter is of type PhysicalActivityLog', () => {
            it('should normally execute the method, returning a PhysicalActivityLogEntity as a result of the transformation', () => {
                const result: PhysicalActivityLogEntity = new PhysicalActivityLogEntityMapper().transform(activityLog)
                assert.propertyVal(result, 'id', activityLog.id)
                assert.deepPropertyVal(result, 'steps', activityLog.steps.map(elem => elem.toJSON()))
                assert.deepPropertyVal(result, 'calories', activityLog.calories.map(elem => elem.toJSON()))
                assert.deepPropertyVal(result, 'active_minutes', activityLog.active_minutes.map(elem => elem.toJSON()))
                assert.deepPropertyVal(result, 'sedentary_minutes', activityLog.sedentary_minutes.map(elem => elem.toJSON()))
            })
        })

        context('when the parameter is a JSON', () => {
            it('should normally execute the method, returning a PhysicalActivityLog as a result of the transformation', () => {
                const result: PhysicalActivityLog = new PhysicalActivityLogEntityMapper().transform(activityLogJSON)
                assert.propertyVal(result, 'id', activityLogJSON.id)
                assert.deepPropertyVal(result, 'steps', activityLogJSON.steps)
                assert.deepPropertyVal(result, 'calories', activityLogJSON.calories)
                assert.deepPropertyVal(result, 'active_minutes', activityLogJSON.active_minutes)
                assert.deepPropertyVal(result, 'sedentary_minutes', activityLogJSON.sedentary_minutes)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should normally execute the method, returning an empty PhysicalActivityLog as a result of the transformation', () => {
                const result: PhysicalActivityLog = new PhysicalActivityLogEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'steps', undefined)
                assert.propertyVal(result, 'calories', undefined)
                assert.propertyVal(result, 'active_minutes', undefined)
                assert.propertyVal(result, 'sedentary_minutes', undefined)
            })
        })
    })
})
