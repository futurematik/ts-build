module.exports = function processFlags(flags) {
  let { d, define, e, env, ...other } = flags;

  if (Object.keys(other).length > 0) {
    throw new Error('unknown ts-build option ' + Object.keys(other).join(', '));
  }

  if (!Array.isArray(d)) {
    d = typeof d !== 'undefined' ? [d] : [];
  }
  if (!Array.isArray(define)) {
    define = typeof define !== 'undefined' ? [define] : [];
  }
  if (!Array.isArray(e)) {
    e = typeof e !== 'undefined' ? [e] : [];
  }
  if (!Array.isArray(env)) {
    env = typeof env !== 'undefined' ? [env] : [];
  }

  const allEnvs = [...e, ...env]
    .map(x => x.split(','))
    .reduce((a, x) => [...a, ...x], [])
    .reduce((a, x) => ({ ...a, [x]: process.env[x] }), {});

  const allDefines = [...d, ...define];

  const defineVars = allDefines
    .map(x => {
      const i = x.indexOf('=');
      if (i === 0) {
        throw new Error('expected define flag to look like key=value');
      }
      if (i < 0) {
        // auto boolean
        return { k: x, v: true };
      }
      return {
        k: x.substring(0, i),
        v: x.substring(i + 1),
      };
    })
    .reduce((a, { k, v }) => ({ ...a, [k]: v }), {});

  return {
    define: { ...defineVars, ...allEnvs },
  };
};
