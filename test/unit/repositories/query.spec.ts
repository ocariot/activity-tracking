import { assert } from 'chai'
// import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Query } from '../../../src/infrastructure/repository/query/query'

describe('Repositories: Query', () => {
    const queryJSON: any = {
        fields: { id: 1, child_id: 1 },
        sort: { created_at: 'desc' },
        pagination: { page: 1, limit: 100 },
        filters: { id: '5a62be07de34500146d9c544' },
    }

    const query: Query = new Query()
    query.fields = ['id', 'child_id']
    query.filters = { id: '5a62be07de34500146d9c544'}

    // describe('convertDatetimeString(value: string)', () => {
    //     context('when the parameter is correct', () => {
    //         it('should normally execute the method "fromJSON"', () => {
    //             // new Activity().fromJSON(activityJSON)
    //             console.log(query.toJSON())
    //         })
    //     })
        //
        // context('when the parameter is invalid', () => {
        //     it('should not normally execute the method "fromJSON"', () => {
        //         const start_time = activityJSON.start_time
        //         try {
        //             activityJSON.start_time = '2019'
        //             new Activity().fromJSON(activityJSON)
        //         } catch (e) {
        //             assert.instanceOf(e, ValidationException)
        //             activityJSON.start_time = start_time
        //         }
        //     })
        // })
    // })

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return an Query model', () => {
                const result = new Query().fromJSON(queryJSON)
                assert(result.fields, 'fields of query must not be undefined')
                assert(result.ordination, 'ordination of query must not be undefined')
                assert(result.pagination, 'pagination of query must not be undefined')
                assert(result.filters, 'filters of query must not be undefined')
            })
        })

        context('when the json is undefined', () => {
            it('should return an Query model with the fields and filters attributes with empty values', () => {
                const result = new Query().fromJSON(undefined)
                assert.isEmpty(result.fields)
                assert.isEmpty(result.filters)
            })
        })

    //     context('when the json is a string', () => {
    //         it('should transform the string in json and return Activity model', () => {
    //             const result = new Activity().fromJSON(JSON.stringify(activityJSON))
    //             assert(result.id, 'Activity id (id of entity class) must not be undefined')
    //             assert.propertyVal(result, 'id', activityJSON.id.toHexString())
    //             assert(result.start_time, 'start_time must not be undefined')
    //             assert(result.end_time, 'end_time must not be undefined')
    //             assert(result.duration, 'duration must not be undefined')
    //             assert.typeOf(result.duration, 'number')
    //             assert.propertyVal(result, 'duration', activityJSON.duration)
    //             assert(result.child_id, 'child_id must not be undefined')
    //             assert.propertyVal(result, 'child_id', activityJSON.child_id.toHexString())
    //         })
    //     })
    // })
    //
    // describe('toJSON()', () => {
    //     context('when the Activity model is correct', () => {
    //         it('should return a JSON from Activity model', () => {
    //             let result = new Activity().fromJSON(activityJSON)
    //             result = result.toJSON()
    //             assert(result.id, 'Activity id (id of entity class) must not be undefined')
    //             assert.propertyVal(result, 'id', activityJSON.id)
    //             assert(result.start_time, 'start_time must not be undefined')
    //             assert(result.end_time, 'end_time must not be undefined')
    //             assert(result.duration, 'duration must not be undefined')
    //             assert.typeOf(result.duration, 'number')
    //             assert.propertyVal(result, 'duration', activityJSON.duration)
    //             assert(result.child_id, 'child_id must not be undefined')
    //             assert.propertyVal(result, 'child_id', activityJSON.child_id)
    //         })
    //     })
    })
})
