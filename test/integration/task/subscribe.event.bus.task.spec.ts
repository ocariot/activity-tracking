import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { Default } from '../../../src/utils/default'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)

describe('Routes: children.physicalactivities', () => {
    // Start services
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)
            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI, { sslOptions: { ca: [] } })
        } catch (err) {
            throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
        }
    })

    // Delete all physical activity objects from the database
    after(async () => {
        try {
            await dbConnection.dispose()
            await rabbitmq.dispose()
        } catch (err) {
            throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
        }
    })
    /**
     * POST route to PhysicalActivity with only one item of this type in the body
     */
    describe('POST /v1/children/:child_id/physicalactivities with only one PhysicalActivity in the body', () => {
        context('when posting a new PhysicalActivity with success', () => {
            it('should return status code 201 and the saved PhysicalActivity', () => {
                //
            })
        })
    })
})
