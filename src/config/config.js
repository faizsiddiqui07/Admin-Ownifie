const production = 'production'
const development = 'development'

const mode = development
let base_url = ''


if (mode === production) {
    base_url = ''
} else {
    // base_url = 'http://localhost:5000'
    base_url="https://ksfqttnct4.execute-api.ap-south-1.amazonaws.com"
}

export {base_url}