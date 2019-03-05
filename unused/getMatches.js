  //TODOC
  // "gather" matched values into a map in preparation to call `compile(match, scope)`
  getMatches(match, scope) {
    const { rule, matched, comment } = match;
    if (!matched) return undefined;
    let results = addResults({}, matched);
    if (comment) {
      scope.parser.warn(`statement ${rule.name} got comment`, comment);
      results.comment = matched.comment;
    }
    return results;

    function addResults(results, matched) {
      for (let i = 0, match; match = matched[i]; i++) {
        const { promote, name } = match;
        if (promote) {
          addResults(results, match.matched);
        } else {
          if (name == null) continue;

          // If arg already exists, convert to an array
          if (name in results) {
            if (!Array.isArray(results[name])) {
              results[name] = [results[name]];
            }
            results[name].push(match);
          } else {
            results[name] = match;
          }
        }
      }
      return results;
    }
  }


