/**
 * Class that defines variables with default values.
 *
 * @see Variables defined in .env will have preference.
 * @see Be careful not to put critical data in this file as it is not in .gitignore.
 * Sensitive data such as database, passwords and keys should be stored in secure locations.
 *
 * @abstract
 */
export abstract class Strings {
    public static readonly APP: any = {
        TITLE: 'Tracking Service',
        APP_DESCRIPTION: 'Micro-service for physical activity, sleep and environmental measurements.'
    }

    public static readonly CHILD: any = {
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {child_id} is not in valid format!'
    }

    public static readonly PHYSICAL_ACTIVITY: any = {
        ALREADY_REGISTERED: 'Physical Activity is already registered...',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {physicalactivity_id} is not in valid format!'
    }

    public static readonly SLEEP: any = {
        ALREADY_REGISTERED: 'Sleep is already registered...',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {sleep_id} is not in valid format!'
    }

    public static readonly BODY_FAT: any = {
        ALREADY_REGISTERED: 'Body Fat is already registered...',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {bodyfat_id} is not in valid format!'
    }

    public static readonly WEIGHT: any = {
        ALREADY_REGISTERED: 'Weight is already registered...',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {weight_id} is not in valid format!'
    }

    public static readonly ENVIRONMENT: any = {
        ALREADY_REGISTERED: 'Environment is already registered...',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {environment_id} is not in valid format!'
    }

    public static readonly INSTITUTION: any = {
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {institution_id} is not in valid format!'
    }

    public static readonly ERROR_MESSAGE: any = {
        UNEXPECTED: 'An unexpected error has occurred. Please try again later...',
        UNABLE_UPDATE: 'Unable to update this attribute.',
        UNABLE_UPDATE_DESC: 'Updateable attributes are: name, calories, steps, distance, levels ' +
            '(only if the update is from an empty array) and heart_rate.',
        UUID_NOT_VALID_FORMAT: 'Some ID provided does not have a valid format!',
        UUID_NOT_VALID_FORMAT_DESC: 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.',
        DISCONTINUED_METHOD: 'Support for this method has been discontinued.',
        INTERNAL_SERVER_ERROR: 'An internal server error has occurred.',
        INVALID_NUMBER: ' must be a valid number!',
        NEGATIVE_NUMBER: ' can\'t be negative!',
        REQUIRED_FIELDS: 'Required fields were not provided...',
        REQUIRED_FIELDS_DESC: ' are required!',
        INVALID_FIELDS: 'One or more request fields are invalid...',
        INVALID_STRING: ' must be a string!',
        EMPTY_STRING: ' must have at least one character!',
        INVALID_DATE: ', is not in valid ISO 8601 format.',
        INVALID_DATE_DESC: 'Date must be in the format: yyyy-MM-dd\'T\'HH:mm:ssZ',
        REPO_CREATE_CONFLICT: 'A registration with the same unique data already exists!'
    }
}
