import { Activity } from './../../../src/models/activity'
import supertest from 'supertest'
import { expect } from 'chai'
import App from './../../../src/app'

var request: any

describe('Routes: Activities', () => {
    const defaultActivity: any =
    {
        _id: '5a62be07de34500146d9c544',
        name: 'walk',
        location: 'UEPB - Universidade Estadual da Paraíba',
        start_time: '2018-08-07T08:25:00.000Z',
        end_time: '2018-08-07T09:25:00.000Z',
        duration: 1075000,
        intensity_level: 'very',
        distance: 25.8,
        calories: 123,
        steps: 1701,
        created_at: '2018-08-10T19:42:40.350Z',
        updatedAt: '2018-08-10T19:42:40.350Z',
        __v: 0
    }

    before(() => App.then((app) => request = supertest(app)))

    after(() => Activity.remove({}))

    describe('POST /users/:user_id/activities', () => {
        context('when posting a new activity', () => {
            it('should return status code 201 with an activity', done => {

                let resultExpect = {
                    _id: '5a62be07de34500146d9c544',
                    name: 'walk',
                    location: 'UEPB - Universidade Estadual da Paraíba',
                    start_time: '2018-08-07T08:25:00.000Z',
                    end_time: '2018-08-07T09:25:00.000Z',
                    duration: 1075000,
                    intensity_level: 'very',
                    distance: 25.8,
                    calories: 123,
                    steps: 1701,
                    created_at: '2018-08-10T19:42:40.350Z',
                    updatedAt: '2018-08-10T19:42:40.350Z',
                    __v: 0
                }

                request
                    .post('/api/v1/users/5a62be07d6f33400146c9b61/activities')
                    .send(defaultActivity)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(201)
                        expect(res.body).to.eql(resultExpect)
                        done(err)
                    })
            })
        })

        context('when there are missing or invalid parameters in request body', () => {

            it('should return status code 400 and info message from invalid user id', done => {
                request
                    .post('/api/v1/users/123/activities')
                    .send(defaultActivity)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(400)
                        expect(res.body).to.have.property('message')
                        expect(res.body).to.have.property('description')
                        done(err)
                    })
            })

            it('should return status code 400 and info message from missing parameters', done => {

                let incompleteActivity = {
                    name: 'walk',
                    location: 'UEPB - Universidade Estadual da Paraíba',
                    start_time: '2018-08-07T08:25:00.000Z',
                    end_time: '2018-08-07T09:25:00.000Z',
                    duration: 1075000,
                    calories: 123,
                }

                request
                    .post('/api/v1/users/5a62be07d6f33400146c9b61/activities')
                    .send(incompleteActivity)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(400)
                        expect(res.body).to.have.property('message')
                        expect(res.body).to.have.property('description')
                        done(err)
                    })
            })
        })

        context('when activity already exists', () => {
            it('should return status code 409 and info message from duplicate data', done => {
                request
                    .post('/api/v1/users/5a62be07d6f33400146c9b61/activities')
                    .send(defaultActivity)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(409)
                        expect(res.body).to.have.property('message')
                        done(err)
                    })
            })
        })
    })

    describe('GET /users/:user_id/activities', () => {
        it('should return status code 200 and a list of activities', done => {

            let resultExpect = [{
                _id: '5a62be07de34500146d9c544',
                name: 'walk',
                location: 'UEPB - Universidade Estadual da Paraíba',
                start_time: '2018-08-07T08:25:00.000Z',
                end_time: '2018-08-07T09:25:00.000Z',
                duration: 1075000,
                intensity_level: 'very',
                distance: 25.8,
                calories: 123,
                steps: 1701,
                created_at: '2018-08-10T19:42:40.350Z',
                updatedAt: '2018-08-10T19:42:40.350Z',
            }]

            request
                .get('/api/v1/users/5a62be07d6f33400146c9b61/activities')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    expect(res.statusCode).to.eql(200)
                    expect(res.body).to.eql(resultExpect)
                    done(err)
                })
        })

        context('when there are no activities from user', () => {
            it('should return status code 404 and info message from activity not found', (done) => {
                request
                    .get('/api/v1/users/5a62be07d6f33400146c9b64/activities')
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(404)
                        expect(res.body).to.have.property('message')
                        done(err)
                    })
            })
        })

        context('when there are invalid parameters in request', () => {
            it('should return status code 400 and info message from invalid user id', (done) => {
                request
                    .get('/api/v1/users/123/activities')
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(400)
                        expect(res.body).to.have.property('message')
                        done(err)
                    })
            })
        })

    })

    describe('GET /users/:user_id/activities/:activity_id', () => {
        it('should return status code 200 and a unique activity', done => {
            let resultExpect =
            {
                _id: '5a62be07de34500146d9c544',
                name: 'walk',
                location: 'UEPB - Universidade Estadual da Paraíba',
                start_time: '2018-08-07T08:25:00.000Z',
                end_time: '2018-08-07T09:25:00.000Z',
                duration: 1075000,
                intensity_level: 'very',
                distance: 25.8,
                calories: 123,
                steps: 1701,
                created_at: '2018-08-10T19:42:40.350Z',
                updatedAt: '2018-08-10T19:42:40.350Z',
                __v: 0
            }

            request
                .get('/api/v1/users/5a62be07d6f33400146c9b61/activities/5a62be07de34500146d9c544')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    expect(res.statusCode).to.eql(200)
                    expect(res.body).to.eql(resultExpect)
                    done(err)
                })
        })

        context('when the activity is not associated with the user', () => {
            it('should return status code 404 and info message from activity not found', (done) => {
                request
                    .get('/api/v1/users/5a62be07d6f33400146c9b62/activities/5a62be07de34500146d9c544')
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(404)
                        expect(res.body).to.have.property('message')
                        done(err)
                    })
            })
        })

        context('when there are invalid parameters in request', () => {
            it('should return status code 400 and info message from invalid user id', (done) => {

                request
                    .get('/api/v1/users/123/activities/5a62be07de34500146d9c544')
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(400)
                        expect(res.body).to.have.property('message')
                        done(err)
                    })
            })

            it('should return status code 400 and info message from invalid activity id', (done) => {

                request
                    .get('/api/v1/users/5a62be07d6f33400146c9b61/activities/433')
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(400)
                        expect(res.body).to.have.property('message')
                        done(err)
                    })
            })
        })
    })

    describe('DELETE /users/:user_id/activities/:activity_id', () => {
        it('should return status code 204', done => {
            request
                .delete('/api/v1/users/5a62be07d6f33400146c9b61/activities/5a62be07de34500146d9c544')
                .expect('')
                .end((err, res) => {
                    expect(res.statusCode).to.eql(204)
                    expect(res.body).to.eql({})
                    done(err)
                })
        })

        context('when there are invalid parameters in request', () => {
            it('should return status code 400 and info message from invalid user id', (done) => {

                request
                    .get('/api/v1/users/123/activities/5a62be07de34500146d9c544')
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(400)
                        expect(res.body).to.have.property('message')
                        done(err)
                    })
            })

            it('should return status code 400 and info message from invalid activity id', (done) => {

                request
                    .get('/api/v1/users/5a62be07d6f33400146c9b61/activities/433')
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(400)
                        expect(res.body).to.have.property('message')
                        done(err)
                    })
            })
        })
    })
})