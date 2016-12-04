var svg = d3.select('svg'),
  margin = {top: 20, right: 20, bottom: 30, left: 40},
  width = +svg.attr('width') - margin.left - margin.right,
  height = +svg.attr('height') - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.json('data/vega-museo-counter.json', function(data) {
  var parseData = {};
  data.forEach(function(d) {
    if(!parseData.hasOwnProperty(d.id)) {
      parseData[d.id] = d.counter;
    } else {
      parseData[d.id] += d.counter;
    }
  });

  var parseData = Object.keys(parseData).map(function(key) {
    return {id: key, count: parseData[key]};
  });

  parseData.sort(function (a, b) {
    if (a.count < b.count) {
      return 1;
    }
    if (a.count > b.count) {
      return -1;
    }
    return 0;
  });

  var totalClicks = parseData.reduce(function(prec, current) {
    return {count: prec.count + current.count};
  });
  console.log(totalClicks);

  document.querySelector('.js-total-clicks').innertHtml = totalClicks.count;

  x.domain(parseData.map(function(d) { return d.id; }));
  y.domain([0, d3.max(parseData, function(d) { return d.count; })]);

  g.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x));

  var alternate_text = false;
  var short_tick_length = 8;
  var long_tick_length = 20;
  d3.selectAll('.axis.axis--x text')
    .attr('y', function () {
      if (alternate_text) {
          alternate_text = false;
          return long_tick_length + 1;
      } else {
          alternate_text = true;
          return short_tick_length + 1;
      }
    });

  g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(y));

  g.selectAll('.bar')
    .data(parseData)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) { return x(d.id); })
    .attr('y', function(d) { return y(d.count); })
    .attr('width', x.bandwidth())
    .attr('height', function(d) { return height - y(d.count); });
});
