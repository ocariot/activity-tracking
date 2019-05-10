import { Sleep } from '../../src/application/domain/model/sleep'
import { SleepPattern, SleepPatternType } from '../../src/application/domain/model/sleep.pattern'
import { SleepPatternDataSet } from '../../src/application/domain/model/sleep.pattern.data.set'

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
        super.pattern = this.generateSleepPattern(super.start_time, super.duration)
    }

    private generateSleepPattern(start_time: Date, duration: number): SleepPattern {
        const sleepPattern = new SleepPattern()
        const dataSet: Array<SleepPatternDataSet> = []
        const dataSetItem: SleepPatternDataSet = new SleepPatternDataSet()
        let countDuration: number = 0

        dataSetItem.start_time = new Date(start_time)
        let _start_time = new Date(start_time)
        while (countDuration < duration) {
            const item: SleepPatternDataSet = this.populateDataSetItem(_start_time)
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

    private populateDataSetItem(start_time: Date): SleepPatternDataSet {
        const dataSetItem: SleepPatternDataSet = new SleepPatternDataSet()
        dataSetItem.start_time = new Date(start_time)
        switch (Math.floor((Math.random() * 3))) { // 0-2
            case 1:
                dataSetItem.name = SleepPatternType.RESTLESS
                dataSetItem.duration = Math.floor(Math.random() * 5 + 1) * 60000 // 1-5min milliseconds
                return dataSetItem
            case 2:
                dataSetItem.name = SleepPatternType.AWAKE
                dataSetItem.duration = Math.floor(Math.random() * 3 + 1) * 60000 // 1-3min in milliseconds
                return dataSetItem
            default: {
                dataSetItem.name = SleepPatternType.ASLEEP
                dataSetItem.duration = Math.floor(Math.random() * 120 + 1) * 60000 // 1-180min in milliseconds
                return dataSetItem
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
}
