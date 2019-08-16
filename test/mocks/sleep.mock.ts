import { Sleep, SleepType } from '../../src/application/domain/model/sleep'
import { SleepPattern } from '../../src/application/domain/model/sleep.pattern'
import {
    PhasesPatternType,
    SleepPatternDataSet,
    StagesPatternType
} from '../../src/application/domain/model/sleep.pattern.data.set'

export class SleepMock extends Sleep {

    constructor() {
        super()
        this.generateSleep()
    }

    private generateSleep(): void {
        super.id = this.generateObjectId()
        super.start_time = new Date(1560826800000 + Math.floor((Math.random() * 1000)))
        super.end_time = new Date(new Date(super.start_time)
            .setMilliseconds(Math.floor(Math.random() * 7 + 4) * 3.6e+6)) // 4-10h in milliseconds
        super.duration = super.end_time.getTime() - super.start_time.getTime()
        super.child_id = '5a62be07de34500146d9c544'
        super.type = this.generateType()
        super.pattern = this.generateSleepPattern(super.start_time, super.duration, super.type)
    }

    private generateSleepPattern(start_time: Date, duration: number, sleepType: SleepType): SleepPattern {
        const sleepPattern = new SleepPattern()
        const dataSet: Array<SleepPatternDataSet> = []
        const dataSetItem: SleepPatternDataSet = new SleepPatternDataSet()
        let countDuration: number = 0

        dataSetItem.start_time = new Date(start_time)
        let _start_time = new Date(start_time)
        while (countDuration < duration) {
            const item: SleepPatternDataSet = this.populateDataSetItem(_start_time, sleepType)
            countDuration += item.duration
            if (countDuration > duration) {
                item.duration = item.duration - (countDuration - duration)
            }
            dataSet.push(item)
            _start_time = new Date(new Date(_start_time).setMilliseconds(item.duration))
        }

        sleepPattern.data_set = dataSet
        return sleepPattern
    }

    private populateDataSetItem(start_time: Date, sleepType: SleepType): SleepPatternDataSet {
        const dataSetItem: SleepPatternDataSet = new SleepPatternDataSet()
        dataSetItem.start_time = new Date(start_time)
        if (sleepType === SleepType.CLASSIC) {
            switch (Math.floor((Math.random() * 3))) { // 0-2
                case 0:
                    dataSetItem.name = PhasesPatternType.RESTLESS
                    dataSetItem.duration = Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min milliseconds
                    return dataSetItem
                case 1:
                    dataSetItem.name = PhasesPatternType.AWAKE
                    dataSetItem.duration = Math.floor(Math.random() * 3 + 1) * 60000 // 1-3min in milliseconds
                    return dataSetItem
                default: {
                    dataSetItem.name = PhasesPatternType.ASLEEP
                    dataSetItem.duration = Math.floor(Math.random() * 120 + 1) * 60000 // 1-180min in milliseconds
                    return dataSetItem
                }
            }
        } else {
            switch (Math.floor((Math.random() * 4))) { // 0-3
                case 0:
                    dataSetItem.name = StagesPatternType.DEEP
                    dataSetItem.duration = Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min milliseconds
                    return dataSetItem
                case 1:
                    dataSetItem.name = StagesPatternType.LIGHT
                    dataSetItem.duration = Math.floor(Math.random() * 3 + 1) * 60000 // 1-3min in milliseconds
                    return dataSetItem
                case 2:
                    dataSetItem.name = StagesPatternType.REM
                    dataSetItem.duration = Math.floor(Math.random() * 3 + 1) * 60000 // 1-3min in milliseconds
                    return dataSetItem
                default: {
                    dataSetItem.name = StagesPatternType.WAKE
                    dataSetItem.duration = Math.floor(Math.random() * 120 + 1) * 60000 // 1-180min in milliseconds
                    return dataSetItem
                }
            }
        }
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    private generateType(): SleepType {
        switch (Math.floor((Math.random() * 2))) { // 0-1
            case 0:
                return SleepType.CLASSIC
            case 1:
                return SleepType.STAGES
            default:
                return SleepType.CLASSIC
        }
    }
}
