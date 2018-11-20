import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IQuery } from '../port/query.interface'
import { ISleepService } from '../port/sleep.service.interface'
import { ISleepRepository } from '../port/sleep.repository.interface'
import { Sleep } from '../domain/model/sleep'
import { SleepValidator } from '../domain/validator/sleep.validator'

/**
 * Implementing sleep Service.
 *
 * @implements {ISleepService}
 */
@injectable()
export class SleepService implements ISleepService {

    constructor(@inject(Identifier.SLEEP_REPOSITORY) private readonly _sleepRepository: ISleepRepository) {
    }

    /**
     * Adds a new sleep.
     * Before adding, it is checked whether the sleep already exists.
     *
     * @param {Sleep} sleep
     * @returns {(Promise<Sleep>)}
     * @throws {ConflictException | RepositoryException} If a data conflict occurs, as an existing sleep.
     */
    public async add(sleep: Sleep): Promise<Sleep> {
        SleepValidator.validate(sleep)
        const sleepExist = await this._sleepRepository.checkExist(sleep)
        if (sleepExist) throw new ConflictException('Sleep is already registered...')
        return this._sleepRepository.create(sleep)
    }

    /**
     * Get the data of all sleep in the infrastructure.
     *
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Sleep>>}
     * @throws {RepositoryException}
     */
    public async getAll(query: IQuery): Promise<Array<Sleep>> {
        return this._sleepRepository.find(query)
    }

    /**
     * Get in infrastructure the sleep data.
     *
     * @param id Unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Sleep>}
     * @throws {RepositoryException}
     */
    public async getById(id: string | number, query: IQuery): Promise<Sleep> {
        query.filters = { _id: id }
        return this._sleepRepository.findOne(query)
    }

    /**
     * Retrieve sleep by unique identifier (ID) and user ID.
     *
     * @param idSleep Sleep unique identifier.
     * @param idUser User unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Array<Sleep>>}
     * @throws {RepositoryException}
     */
    public getByIdAndUser(idSleep: string, idUser: string, query: IQuery): Promise<Sleep> {
        query.filters = { _id: idSleep, user: idUser }
        return this._sleepRepository.findOne(query)
    }

    /**
     * List the sleep of a user.
     *
     * @param idUser User unique identifier.
     * @param query Defines object to be used for queries.
     * @return {Promise<Sleep>}
     * @throws {ValidationException | RepositoryException}
     */
    public getAllByUser(idUser: string, query: IQuery): Promise<Array<Sleep>> {
        query.filters = Object.assign({ user: idUser }, query.filters)
        return this._sleepRepository.find(query)
    }

    /**
     * Update user sleep data.
     *
     * @param sleep Containing the data to be updated
     * @param idUser User unique identifier.
     * @return {Promise<Sleep>}
     * @throws {ValidationException | ConflictException | RepositoryException}
     */
    public updateByUser(sleep: Sleep, idUser: string): Promise<Sleep> {
        return this._sleepRepository.updateByUser(sleep, idUser)
    }

    /**
     * Remove sleep according to its unique identifier and related user.
     *
     * @param idSleep Unique identifier.
     * @param idUser User unique identifier.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    public removeByUser(idSleep: string | number, idUser: string): Promise<boolean> {
        return this._sleepRepository.removeByUser(idSleep, idUser)
    }

    public async update(sleep: Sleep): Promise<Sleep> {
        throw new Error('Unsupported feature!')
    }

    public async remove(id: string | number): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }
}
