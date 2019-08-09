import { ChildLog } from '../../src/application/domain/model/child.log'
import { LogType } from '../../src/application/domain/model/log'
import { LogMock } from './log.mock'

export class ChildLogMock extends ChildLog {

    constructor() {
        super()
        this.generateChildLog()
    }

    private generateChildLog(): void {
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
}
