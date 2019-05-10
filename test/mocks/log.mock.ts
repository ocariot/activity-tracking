import { Log, LogType } from '../../src/application/domain/model/log'

export class LogMock extends Log {

    constructor(type?: LogType) {
        super()
        this.generateLog(type)
    }

    private generateLog(type?: LogType): void {
        if (!type) type = this.generateType()

        super.id = this.generateObjectId()
        super.date = this.generateDate()
        super.value = Math.floor(Math.random() * 10 + 1) * 100
        super.type = type
        super.child_id = this.generateObjectId()
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    private generateDate(): string {
        const dateStart = new Date(2018, 4, 15)
        const dateEnd = new Date()
        const randomDateMilliseconds = dateEnd.getTime() + Math.floor(Math.random() * (dateEnd.getTime() - dateStart.getTime()))

        const date = new Date(randomDateMilliseconds)

        const month = date.getMonth() + 1
        let monthString = month.toString()

        const day = date.getDate()
        let dayString = day.toString()

        // Pass the month to the valid format
        if (monthString.length === 1) monthString = monthString.padStart(2, '0')

        // Pass the day to the valid format
        if (dayString.length === 1) dayString = dayString.padStart(2, '0')

        return `${date.getFullYear()}-${monthString}-${dayString}`
    }

    private generateType(): LogType {
        let logType
        switch (Math.floor((Math.random() * 2 + 1))) { // 1 or 2
            case 1:
                logType = LogType.STEPS
                return logType
            case 2:
                logType = LogType.CALORIES
                return logType
            default:
                return LogType.STEPS
        }
    }
}
