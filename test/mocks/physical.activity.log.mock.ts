import { PhysicalActivityLog } from '../../src/application/domain/model/physical.activity.log'
import { LogType } from '../../src/application/domain/model/log'
import { LogMock } from './log.mock'

export class PhysicalActivityLogMock extends PhysicalActivityLog {

    constructor() {
        super()
        this.generatePhysicalActivityLog()
    }

    private generatePhysicalActivityLog(): void {
        super.id = this.generateObjectId()
        super.steps = [ new LogMock(LogType.STEPS),
                        new LogMock(LogType.STEPS),
                        new LogMock(LogType.STEPS)]
        super.calories = [  new LogMock(LogType.CALORIES),
                            new LogMock(LogType.CALORIES),
                            new LogMock(LogType.CALORIES)]
        super.active_minutes = [  new LogMock(LogType.ACTIVE_MINUTES),
                                  new LogMock(LogType.ACTIVE_MINUTES),
                                  new LogMock(LogType.ACTIVE_MINUTES)]
        super.sedentary_minutes = [  new LogMock(LogType.SEDENTARY_MINUTES),
                                     new LogMock(LogType.SEDENTARY_MINUTES),
                                     new LogMock(LogType.SEDENTARY_MINUTES)]
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }
}
