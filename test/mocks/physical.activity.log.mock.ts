import { PhysicalActivityLog } from '../../src/application/domain/model/physical.activity.log'
import { Log, LogType } from '../../src/application/domain/model/log'

export class PhysicalActivityLogMock extends PhysicalActivityLog {

    constructor(logsArr: Array<Log>) {
        super()
        this.generatePhysicalActivityLog(logsArr)
    }

    private generatePhysicalActivityLog(logsArr: Array<Log>): void {
        super.steps = new Array<Log>()
        super.calories = new Array<Log>()
        logsArr.forEach(elem => {
            if (elem.type === LogType.STEPS) super.steps.push(elem)
            if (elem.type === LogType.CALORIES) super.calories.push(elem)
        })
    }
}
