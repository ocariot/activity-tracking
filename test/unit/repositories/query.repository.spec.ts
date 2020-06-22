import { assert } from 'chai'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { IQuery } from '../../../src/application/port/query.interface'

describe('Repositories: Query', () => {
    const queryJSON: any = {
        fields: { id: 1, child_id: 1 },
        sort: { created_at: -1 },
        pagination: { page: 1, limit: 100 },
        filters: { id: '5a62be07de34500146d9c544' }
    }

    let query: IQuery = new Query()
    query.fields = ['id', 'child_id']
    query.filters = { id: '5a62be07de34500146d9c544'}

    describe('addOrdination(field: string, order: string)', () => {
        context('when the ordination has already been instantiated', () => {
            it('should normally execute the method', () => {
                query.addOrdination('created_at', -1)
                query.addOrdination('id', 1)

                const ordinationMap = new Map()

                ordinationMap.set('created_at', -1)
                ordinationMap.set('id', 1)

                assert.deepEqual(query.ordination, ordinationMap)
            })
        })

        context('when the ordering has not yet been instantiated', () => {
            it('should normally execute the method"', () => {
                query.ordination = undefined!
                query.addOrdination('id', 'asc')

                const ordinationMap = new Map()

                ordinationMap.set('id', 'asc')

                assert.deepEqual(query.ordination, ordinationMap)
            })
        })
    })

    describe('addFilter(filter: object)', () => {
        context('when the parameter is valid', () => {
            it('should normally execute the method', () => {
                query.addFilter({
                    child_id: '5a62be07de34500146d9c544'
                })

                assert.deepEqual(query.filters, { id: '5a62be07de34500146d9c544', child_id: '5a62be07de34500146d9c544' })
            })
        })

        context('when the parameter is undefined', () => {
            it('should normally execute the method"', () => {
                query.addFilter(undefined!)

                assert.deepEqual(query.filters, { id: '5a62be07de34500146d9c544', child_id: '5a62be07de34500146d9c544' })
            })
        })
    })

    describe('fromJSON(json: any)', () => {
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
            it('should return an Query model with the attributes with default values', () => {
                const result = new Query().fromJSON(undefined)
                assert.isEmpty(result.fields)
                assert.isEmpty(result.filters)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Query model is correct', () => {
            it('should return a JSON from Query model', () => {
                query = query.toJSON()
                assert(query.fields, 'fields of query must not be undefined')
                assert(query.ordination, 'ordination of query must not be undefined')
                assert(query.pagination, 'pagination of query must not be undefined')
                assert(query.filters, 'filters of query must not be undefined')
            })
        })
    })
})
