import sinon from 'sinon'
import { ActivityController } from '../../../src/controllers/activities.controller'
import { assert, expect } from 'chai'
import { IExceptionError, ApiException } from '../../../src/exceptions/api.exception'
import { Activity } from '../../../src/models/activity'
import { ActivityRepository } from '../../../src/repositories/activity.repository';
import { Request, Response } from 'express'

const ActivityFake: any = Activity

describe('Controllers: Activity', () => {
    const defaultActivity: any =
    {
        "id": "5a62be07de34500146d9c544",
        "user_id": "5a62be07d6f33400146c9b61",
        "name": "walk",
        "location": "UEPB - Universidade Estadual da Paraíba",
        "start_time": 1533754046,
        "end_time": 1533757646,
        "duration": 1075000,
        "intensity_level": "very",
        "distance": 25.8,
        "calories": 123,
        "heartrate": 120,
        "steps": 1701
    }

    describe('getAllActivities()', () => {
        it('should call send with a list of activities', () => {


        })
    })

})