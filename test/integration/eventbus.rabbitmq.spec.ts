import { DI } from '../../src/di/di'
import { Identifier } from '../../src/di/identifiers'
import { IEventBus } from '../../src/infrastructure/port/event.bus.interface'
import { Container } from 'inversify'
import { PhysicalActivitySaveEvent } from '../../src/application/integration-event/event/physical.activity.save.event'
import { PhysicalActivity } from '../../src/application/domain/model/physical.activity'
import { ActivityLevelType, PhysicalActivityLevel } from '../../src/application/domain/model/physical.activity.level'

const container: Container = DI.getInstance().getContainer()
const eventBus: IEventBus = container.get(Identifier.RABBITMQ_EVENT_BUS)

describe('EVENT BUS', () => {
    // before(() => {
    // })

    // beforeEach(() => {
    // })
    //
    // afterEach(() => {
    // })

    describe('PUBLISH', () => {
        context('when an id is specified', () => {
            it('should return status code 200 with one child', () => {
                for (let i = 0; i < 100; i++) {
                    eventBus.publish(
                        new PhysicalActivitySaveEvent('PhysicalActivitySaveEvent', new Date(),
                            generateActivity(ActivityType.RUN)),
                        'activities.save'
                    )
                }
            })
        })
    })
})

function generateActivity(type: ActivityType): PhysicalActivity {
    // Math.floor(Math.random() * 10)
    const physicalActivity: PhysicalActivity = new PhysicalActivity()
    physicalActivity.id = getObjectID()
    physicalActivity.name = type
    physicalActivity.duration = Math.floor((Math.random() * 36 + 10) * 60000) //  10-45min in milliseconds
    physicalActivity.start_time = new Date()
    physicalActivity.end_time = new Date(physicalActivity.start_time.setMilliseconds(physicalActivity.duration))
    physicalActivity.child_id = '5a62be07de34500146d9c544'
    physicalActivity.calories = Math.floor((Math.random() * 20001 + 500)) // 500-20000

    if (type === ActivityType.WALK || type === ActivityType.RUN) {
        physicalActivity.steps = Math.floor((Math.random() * 20001 + 100)) // 100-15000
        if (Math.random() >= 0.5) { // true or false random
            physicalActivity.levels = generatePhysicalActivityLevels()
        }
        return physicalActivity
    } else {
        physicalActivity.levels = generatePhysicalActivityLevels()
    }
    return physicalActivity
}

function generatePhysicalActivityLevels(): Array<PhysicalActivityLevel> {
    const levels: Array<PhysicalActivityLevel> = []
    levels.push(new PhysicalActivityLevel(ActivityLevelType.SEDENTARY, Math.floor((Math.random() * 10) * 60000)))
    levels.push(new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000)))
    levels.push(new PhysicalActivityLevel(ActivityLevelType.FAIRLY, Math.floor((Math.random() * 10) * 60000)))
    levels.push(new PhysicalActivityLevel(ActivityLevelType.VERY, Math.floor((Math.random() * 10) * 60000)))
    return levels
}

function getObjectID() {
    const chars = 'abcdef0123456789'
    let randS = ''
    for (let i = 0; i < 24; i++) {
        randS += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return randS
}

enum ActivityType {
    WALK = 'walk',
    RUN = 'run',
    SWIM = 'swim',
    BIKE = 'bike',
    SLEEP = 'sleep'
}
