process.env.NODE_ENV = 'test'
var context = require.context('./', true, /Tests\.js$/)
context.keys().forEach(context)
