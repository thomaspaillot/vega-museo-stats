var GraphClickByDate = function() {
  function parseData(data) {
    var parseStats = _.countBy(data, d => moment(d.date).set({h: 0, m: 0, s: 0, ms: 0}).valueOf());
    return Object.keys(parseStats).map(function(key) {
      return {date: new Date(+key), value: parseStats[key]};
    });
  }

  function drawGraph(data) {
    MG.data_graphic({
      data: data,
      missing_is_hidden: true,
      width: 3400,
      height: 360,
      left: 75,
      interpolate: d3.curveLinear,
      target: document.querySelector('.js-time-chart')
    });
  }

  return {
    parse: parseData,
    draw: drawGraph
  }
}();
