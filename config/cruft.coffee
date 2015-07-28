module.exports = (dependencies) ->
  {packages: {path}} = dependencies
  return [
    {
      name: 'Todo Comments'
      regex: /^[\+|\-]?[\s]*[\W]*[\s]*TODO[\W|\s]*(?=\w+)/i
    },
    {
      name: 'Ignored Tests'
      regex: /^[\s]*@Ignore/i
    }
  ]
