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
        APP_DESCRIPTION: 'Micro-service for physical activity, sleep and environmental measurements (temperature and humidity).'
    }

    public static readonly CHILD: any = {
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {child_id} is not in valid format!'
    }

    public static readonly PHYSICAL_ACTIVITY: any = {
        ALREADY_REGISTERED: 'Physical Activity is already registered!',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {physicalactivity_id} is not in valid format!'
    }

    public static readonly SLEEP: any = {
        ALREADY_REGISTERED: 'Sleep is already registered!',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {sleep_id} is not in valid format!'
    }

    public static readonly BODY_FAT: any = {
        ALREADY_REGISTERED: 'Body Fat is already registered!',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {bodyfat_id} is not in valid format!'
    }

    public static readonly WEIGHT: any = {
        ALREADY_REGISTERED: 'Weight is already registered!',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {weight_id} is not in valid format!'
    }

    public static readonly ENVIRONMENT: any = {
        ALREADY_REGISTERED: 'Environment is already registered!',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {environment_id} is not in valid format!'
    }

    public static readonly ERROR_MESSAGE: any = {
        UNEXPECTED: 'An unexpected error has occurred. Please try again later...',
        NEGATIVE_PARAMETER: 'The value provided has a negative value!',
        UUID_NOT_VALID_FORMAT: 'Some ID provided does not have a valid format!',
        UUID_NOT_VALID_FORMAT_DESC: 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.'
    }
}
