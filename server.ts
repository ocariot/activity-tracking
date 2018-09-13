import http from 'http'
import App from './src/app'
import config from './config/config';

const port = process.env.PORT || config.PORT

App.then((app) => {
    app.listen(port, () => console.log(`Server running on port ${port}`))
}).catch(err => {
    console.error(err.message)
    process.exit(1)
})