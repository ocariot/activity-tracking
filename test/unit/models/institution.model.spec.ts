import { ObjectID } from 'bson'
import { assert } from 'chai'
import { Institution } from '../../../src/application/domain/model/institution'

describe('Models: Institution', () => {
    const institutionJSON: any = {
        id: new ObjectID()
    }

    const emptyInstitutionJSON: any = {}

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an Institution model', () => {
                const result = new Institution().fromJSON(institutionJSON)
                assert.propertyVal(result, 'id', institutionJSON.id)
            })
        })

        context('when the json is empty', () => {
            it('should return an empty Institution model', () => {
                const result = new Institution().fromJSON(emptyInstitutionJSON)
                assert.propertyVal(result, 'id', emptyInstitutionJSON.id)
            })
        })

        context('when the json is undefined', () => {
            it('should return an Institution model with id with undefined value', () => {
                const result = new Institution().fromJSON(undefined)
                assert.isUndefined(result.id)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Institution model', () => {
                const result = new Institution().fromJSON(JSON.stringify(institutionJSON))
                assert.propertyVal(result, 'id', institutionJSON.id.toHexString())
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Institution model is correct', () => {
            it('should return a JSON from Institution model', () => {
                let result = new Institution().fromJSON(institutionJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', institutionJSON.id)
            })
        })
    })
})
