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
        NEGATIVE_NUMBER: '{0} must be a number equal to or greater than zero.',
        NEGATIVE_INTEGER: '{0} must be an integer equal to or greater than zero.',
        INTEGER_GREATER_ZERO: '{0} must be an integer greater than zero.',
        INVALID_NUMBER: '{0} must be a valid number.',
        REQUIRED_FIELDS: 'Required fields were not provided...',
        REQUIRED_FIELDS_DESC: '{0} are required!',
        INVALID_FIELDS: 'One or more request fields are invalid...',
        INVALID_STRING: '{0} must be a string!',
        EMPTY_STRING: '{0} must have at least one character!',
        INVALID_START_TIME: 'The end_time parameter can not contain an older date than that the start_time parameter!',
        YEAR_NOT_ALLOWED: 'Date {0} has year not allowed. The year must be greater than 1678 and less than 2261.',
        INVALID_DATE_FORMAT: 'Date: {0}, is not in valid ISO 8601 format.',
        INVALID_DATE_FORMAT_DESC: 'Date must be in the format: yyyy-MM-dd',
        INVALID_DATETIME_FORMAT: 'Datetime: {0}, is not in valid ISO 8601 format.',
        INVALID_DATETIME_FORMAT_DESC: 'Datetime must be in the format: yyyy-MM-ddTHH:mm:ssZ',
        DATE_RANGE_INVALID: 'The interval between dates {0} and {1} is invalid!',
        DATE_RANGE_INVALID_DESC: 'The date_end parameter can not contain an older date than that the date_start parameter!',
        DATE_RANGE_EXCEED_YEAR_DESC: 'The period between the received dates can not exceed one year!',
        REPO_CREATE_CONFLICT: 'A registration with the same unique data already exists!'
    }
}
