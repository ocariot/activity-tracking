import { PhysicalActivityLog } from '../../src/application/domain/model/physical.activity.log'
import { Log, LogType } from '../../src/application/domain/model/log'

export class PhysicalActivityLogMock extends PhysicalActivityLog {

    constructor(logsArr: Array<Log>) {
        super()
        super.fromJSON(this.generatePhysicalActivityLog(logsArr))
    }

    private generatePhysicalActivityLog(logsArr: Array<Log>): PhysicalActivityLog {
        const physicalActivityLog: PhysicalActivityLog = new PhysicalActivityLog()
        physicalActivityLog.steps = new Array<Log>()
        physicalActivityLog.calories = new Array<Log>()
        logsArr.forEach(elem => {
            if (elem.type === LogType.STEPS) physicalActivityLog.steps.push(elem)
            if (elem.type === LogType.CALORIES) physicalActivityLog.calories.push(elem)
        })

        return physicalActivityLog
    }
}
