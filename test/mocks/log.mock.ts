import { Log, LogType } from '../../src/application/domain/model/log'

export class LogMock {

    public static generateLog(): Log {
        const log: Log = new Log()
        log.id = this.generateObjectId()
        log.date = this.generateDate()
        log.value = Math.floor(Math.random() * 10 + 1) * 100
        log.type = this.generateType()
        log.child_id = this.generateObjectId()

        return log
    }

    private static generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    private static generateDate(): string {
        const date = new Date()
        const dateReturn = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        return dateReturn
    }

    private static generateType() {
        let logType
        switch (Math.floor((Math.random() * 2 + 1))) { // 1 or 2
            case 1:
                logType = LogType.STEPS
                return logType
            case 2:
                logType = LogType.CALORIES
                return logType
        }
    }
}
