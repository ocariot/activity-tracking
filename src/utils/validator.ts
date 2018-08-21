import mongoose from 'mongoose';

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
    public static validateUserId(id): boolean {
        var valid = false;
        try {
            if (id == new mongoose.Types.ObjectId("" + id))
                valid = true;
        }
        catch (e) {
            valid = false;
        }
        return valid;
    }
}