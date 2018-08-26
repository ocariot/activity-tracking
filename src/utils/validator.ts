import mongoose, { Error } from 'mongoose';
import { throws } from 'assert';
import { ApiException } from './../exceptions/api.exception';

/**
 * Validator that validate params from requests.
 * 
 * @author Lucas Rocha <lucas.rocha@nutes.uepb.edu.br>
 * @version 1.0
 * @copyright Copyright (c) 2018, NUTES/UEPB. 
 */
export class Validator {

    /**
     * Validate if id is in ObjectId format (mongoose)
     * @param id Id to be validated
     * @returns True, if the id is in the default of an ObjectID and
     * otherwise, returns False
     */
    public static validateObjectId(id: any): boolean {
        try {
            return id == new mongoose.Types.ObjectId(id);
        } catch (e) {
            throw new ApiException(400, "Invalid ID", e.message);
        }
    }
}