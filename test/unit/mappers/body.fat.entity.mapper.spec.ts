import { ObjectID } from 'bson'
import { assert } from 'chai'
import { BodyFatMock } from '../../mocks/body.fat.mock'
import { BodyFatEntityMapper } from '../../../src/infrastructure/entity/mapper/body.fat.entity.mapper'
import { MeasurementType } from '../../../src/application/domain/model/measurement'
import { BodyFatEntity } from '../../../src/infrastructure/entity/body.fat.entity'
import { BodyFat } from '../../../src/application/domain/model/body.fat'

describe('Mappers: BodyFatEntityMapper', () => {
    const bodyFat: BodyFat = new BodyFatMock()

    // To test how mapper works with an object without any attributes
    const emptyBodyFat: BodyFat = new BodyFat()
    emptyBodyFat.type = ''
    emptyBodyFat.unit = undefined

    // Create BodyFat JSON
    const bodyFatJSON: any = {
        id: new ObjectID(),
        type: MeasurementType.BODY_FAT,
        timestamp: new Date().toISOString(),
        value: Math.random() * 10 + 20, // 20-29
        unit: '%',
        child_id: '5a62be07de34500146d9c544'
    }

    // To test how mapper works with an object without any attributes (JSON)
    const emptyBodyFatJSON: any = {}

    describe('transform(item: any)', () => {
        context('when the parameter is of type BodyFat', () => {
            it('should normally execute the method, returning a BodyFatEntity as a result of the transformation', () => {
                const result: BodyFatEntity = new BodyFatEntityMapper().transform(bodyFat)
                assert.propertyVal(result, 'id', bodyFat.id)
                assert.propertyVal(result, 'type', bodyFat.type)
                assert.propertyVal(result, 'timestamp', bodyFat.timestamp)
                assert.propertyVal(result, 'value', bodyFat.value)
                assert.propertyVal(result, 'unit', bodyFat.unit)
                assert.propertyVal(result, 'child_id', bodyFat.child_id)
            })
        })

        context('when the parameter is of type BodyFat and does not contain any attributes', () => {
            it('should normally execute the method, returning an empty BodyFatEntity', () => {
                const result: BodyFatEntity = new BodyFatEntityMapper().transform(emptyBodyFat)
                assert.isEmpty(result)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should normally execute the method, returning a BodyFat as a result of the transformation', () => {
                const result: BodyFat = new BodyFatEntityMapper().transform(bodyFatJSON)
                assert.propertyVal(result, 'id', bodyFatJSON.id)
                assert.propertyVal(result, 'type', bodyFatJSON.type)
                assert.propertyVal(result, 'timestamp', bodyFatJSON.timestamp)
                assert.propertyVal(result, 'value', bodyFatJSON.value)
                assert.propertyVal(result, 'unit', bodyFatJSON.unit)
                assert.propertyVal(result, 'child_id', bodyFatJSON.child_id)
            })
        })

        context('when the parameter is a JSON and does not contain any attributes', () => {
            it('should normally execute the method, returning a BodyFat as a result of the transformation', () => {
                const result: BodyFat = new BodyFatEntityMapper().transform(emptyBodyFatJSON)
                assert.propertyVal(result, 'id', emptyBodyFatJSON.id)
                assert.propertyVal(result, 'type', MeasurementType.BODY_FAT)
                assert.propertyVal(result, 'timestamp', emptyBodyFatJSON.timestamp)
                assert.propertyVal(result, 'value', emptyBodyFatJSON.value)
                assert.propertyVal(result, 'unit', '%')
                assert.propertyVal(result, 'child_id', emptyBodyFatJSON.child_id)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should normally execute the method, returning an empty BodyFat as a result of the transformation', () => {
                const result: BodyFat = new BodyFatEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'type', MeasurementType.BODY_FAT)
                assert.propertyVal(result, 'timestamp', undefined)
                assert.propertyVal(result, 'value', undefined)
                assert.propertyVal(result, 'unit', '%')
                assert.propertyVal(result, 'child_id', undefined)
            })
        })
    })
})
