/**
 * Refactor an object of type JSON according to defined parameters.
 * 
 * @author Lucas Rocha <lucas.rocha@nutes.uepb.edu.br>
 * @version 1.0
 * @copyright Copyright (c) 2018, NUTES/UEPB. 
 */
export class Refactor {

    /**
     * Empty constructor
     */
    constructor() {
    }

    /**
     * Method used to refactor an object of type JSON. It is used 
     * to treat any object in which you want to change the variable 
     * "_id" to "id" and that you want to remove the "user_id" 
     * parameters of the object.
     * @param object The parameter can be an object of any type. 
     * Within the method, validation will be performed to verify 
     * that the paramer is a JSON, for handling the id of the 
     * object and the id of the user.
     * @returns The return can be the object refactored, or it can 
     * return undefined if the received parameter is not a JSON type file.
     */
    public static refactorObject(object: any): any {
        if (object && typeof object === 'object') {
            object.id = object._id
            delete object._id
            if (object.user_id && typeof object.user_id === 'string')
                delete object.user_id
            return object
        }
        return undefined
    }
}