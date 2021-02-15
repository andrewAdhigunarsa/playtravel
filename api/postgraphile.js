const { postgraphile } = require('postgraphile')

const { DATABASE_URL } = process.env

module.exports = postgraphile(
    DATABASE_URL || 'postgres://andrewadhigunarsa:password@localhost:5432/api',
    'public',
    {
        watchPg: true,
        graphiql: true,
        enhanceGraphiql: true,
        pgDefaultRole:'anonymous',
        enableCors:true,
        showErrorStack:true,
        handleErrors:(errors, res, req)=>{
            return errors;
        }
    }
)
