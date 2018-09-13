import { Router } from 'express'

/**
 * Interface that represents the base types of a Router.
 * 
 * @template T 
 * @author Lucas Rocha <lucas.rocha@nutes.uepb.edu.br>
 * @version 1.0
 * @copyright Copyright (c) 2018, NUTES/UEPB. 
 */
export interface IRouter<T> {
    router: Router
    controller?: T
    initialize(): any
}