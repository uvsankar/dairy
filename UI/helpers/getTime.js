_ = require('lodash')

module.exports = function(){
  let context = arguments[0].data.root
  //This is not the correct way.
  // Pass the date as argument if needed
  let date = _.isEmpty(context.entry) ? new Date() : new Date(context.entry.createdDate); 
  return date.toDateString()
}