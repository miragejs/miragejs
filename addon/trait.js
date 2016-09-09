let trait = function(extension) {
  let __isTrait__ = true;
  return {
    extension,
    __isTrait__
  };
};

export default trait;
