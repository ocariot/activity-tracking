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
     * @param id 
     * @returns valid: true or false
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