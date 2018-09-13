/**
 * Class that defines application configuration variables.
 * 
 * @author Lucas Rocha <lucas.rocha@nutes.uepb.edu.br>
 */
class Configs {
    /**
     * Provide configuration variables here.
     * Example: key: string = 'kEY_VALUE'
     */
    APP_TITLE = 'Activity Tracking Service'
    APP_DESCRIPTION = 'Microservice for activity collection'
    DB_URI: string = 'mongodb://mongo:27017/activity-tracking-service'
    DB_URI_TEST: string = 'mongodb://mongo:27017/activity-tracking-service-test'
    README_DEFAULT: string = `<h2>${this.APP_TITLE} - <small>${this.APP_DESCRIPTION}.</small></h2>
    <p>Access the API documentation <a href="/api/v1/reference" >v.1.0 </a></p>`
    PORT: number = 3000
}

export default new Configs()