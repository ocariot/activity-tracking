/**
 * Interface Repository
 * 
 * @template T 
 * @author Lucas Rocha <lucas.rocha@nutes.uepb.edu.br>
 * @version 1.0
 * @copyright Copyright (c) 2018, NUTES/UEPB. 
 */
export interface IRepository<T> {
    save(item: T): Promise<T>
    getAll(param1?: string, param2?: string, querys?: any): Promise<Array<T>>
    getById(param1: string, param2?: string, querys?: any | undefined): Promise<T>
    update(item: T): Promise<T>
    delete(id:string): Promise<boolean>
}