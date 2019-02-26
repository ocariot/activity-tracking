import { LogType } from '../../application/domain/model/log'

export class LogEntity {
    public id?: string
    public date?: Date // Date value of log
    public value?: number // Calories value of log
    public type?: LogType // Log type
    public child_id?: string // Child ID
}
