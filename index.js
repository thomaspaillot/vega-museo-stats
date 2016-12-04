document.addEventListener('DOMContentLoaded', function() {
  var MAX_RADIUS = 20;
  var MAX_SURFACE = 2 * Math.PI * Math.pow(MAX_RADIUS, 2);
  const startHour = 9;
  const endHour = 18;
  const hourSpan = 10;
  const height = hourSpan * MAX_RADIUS*2;
  const margin = {
    left: 80
  }

  fetch('data/vega-museo-stats.json')
    .then(res => res.json())
    .then(parseData)
    .then(drawGraph);

  function parseData(data) {
    var startDate = moment(data[0].date).set({h: startHour, m: 0, s: 0, ms: 0});
    var endDate = moment(data[data.length-1].date).set({h: endHour, m: 0, s: 0, ms: 0});
    return accumulateHoursClicks(fillData(_.countBy(data, d => moment(d.date).set({m: 0, s: 0, ms: 0}).valueOf()), startDate, endDate));
  }

  function fillData(data, startDate, endDate) {
    var iterDate = startDate.clone();
    var filledData = {};
    while(iterDate.isBefore(endDate)) {
      iterDay = iterDate.valueOf();
      filledData[iterDay] = {hours: []};
      for (var i = 0; i < hourSpan; i++) {
        if(!data.hasOwnProperty(iterDate.valueOf())) {
          filledData[iterDay].hours.push(0);
        } else {
          filledData[iterDay].hours.push(data[iterDate.valueOf()]);
        }
        iterDate.add(1, 'hour');
      }
      iterDate.hour(startHour);
      iterDate.add(1, 'day');
    }

    return filledData;
  }

  function accumulateHoursClicks(data) {
    for(day in data) {
      var total = _.reduce(data[day].hours, (sum, n) => sum + n, 0);
      data[day].total = total;
    }

    return data;
  }

  function drawXLabel(x, date) {
    d3.select('.js-punch-chart')
      .append('text')
      .text(date)
      .attr('x', x)
      .attr('y', height)
      .attr('class', 'punch-card-axe-label')
      .attr('text-anchor', 'middle');
  }

  function drawYLabel(y, hour) {
    d3.select('.js-punch-chart')
      .append('text')
      .text(hour + 'h')
      .attr('x', margin.left/2)
      .attr('y', y + 3)
      .attr('class', 'punch-card-axe-label')
      .attr('text-anchor', 'end');
  }

  function drawLegend(scale) {
    d3.select('.js-punch-chart-legend')
      .append('circle')
      .attr('r', getRadius(500, scale))
      .attr('cx', MAX_RADIUS)
      .attr('cy', MAX_RADIUS);
    d3.select('.js-punch-chart-legend')
      .append('circle')
      .attr('r', getRadius(20, scale))
      .attr('cx', MAX_RADIUS*3)
      .attr('cy', MAX_RADIUS);
    d3.select('.js-punch-chart-legend')
      .append('text')
      .text(500)
      .attr('x', MAX_RADIUS)
      .attr('y', MAX_RADIUS*2 + 20)
      .attr('text-anchor', 'middle');
    d3.select('.js-punch-chart-legend')
      .append('text')
      .text(20)
      .attr('x', MAX_RADIUS*3)
      .attr('y', MAX_RADIUS*2 + 20)
      .attr('text-anchor', 'middle');
  }

  function getRadius(value, scale) {
    var scaledSurface = MAX_SURFACE * scale(value);
    return Math.sqrt((scaledSurface / (2 * Math.PI)));
  };

  function drawLines() {
    for (var i = 0; i < hourSpan; i++) {
      d3.select('.js-punch-chart').append('line')
        .attr('x1', margin.left/2)
        .attr('y1', (MAX_RADIUS*2*i) + MAX_RADIUS)
        .attr('x2', '100%')
        .attr('y2', (MAX_RADIUS*2*i) + MAX_RADIUS)
        .attr('class', 'punch-card-line');
    }
  }

  function drawGraph(data) {
    d3.select('.js-punch-chart')
      .attr('width', Object.keys(data).length * MAX_RADIUS*2)
      .attr('height', height);

    var max = d3.max(d3.entries(data), d => d3.max(d.value.hours));
    var scale = d3.scaleLinear().domain([0, max]).range([0, 1]);
    var x = 0;
    var y = 0;

    drawLegend(scale);
    drawLines();

    for(var day in data) {
      drawXLabel(x + margin.left, moment(+day).format('DD/MM'));

      d3.select('.js-punch-chart').append('rect')
        .attr('width', 20)
        .attr('height', scale(data[day].total)*100)
        .attr('x', x + margin.left - 10)
        .attr('y', height + 20)
        .attr('class', 'punch-card-bar');

      d3.select('.js-punch-chart')
        .append('text')
        .text((data[day].total || ''))
        .attr('x', x + margin.left)
        .attr('y', height + scale(data[day].total)*100 + 40)
        .attr('class', 'punch-card-axe-label')
        .attr('text-anchor', 'middle');

      data[day].hours.forEach(function(h, index) {
        if(x === 0) {
          drawYLabel(y, index + startHour)
        }

        var radius = (getRadius(h, scale) === 0) ? 1 : getRadius(h, scale);
        d3.select('.js-punch-chart').append('circle')
          .attr('r', radius)
          .attr('cx', x + margin.left)
          .attr('cy', y)
          .attr('class', 'punch-card-punch')
          .append('title').text(`Clics : ${h}`);


        y += MAX_RADIUS*2;
      });

      y = 0;
      x += MAX_RADIUS*2;
    }
  }


  // fetch('data/vega-museo-stats.json')
  //   .then(res => res.json())
  //   .then(GraphClickByDate.parse)
  //   .then(GraphClickByDate.draw);
});
