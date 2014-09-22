var height = 250;
var width = 600;

var dataset = d3.shuffle(d3.range(1, 11));

var x = d3.scale.ordinal()
  .domain(d3.range(dataset.length))
  .rangeRoundBands([0, width], 0.03);

var y = d3.scale.linear()
  .domain([0, d3.max(dataset)])
  .range([0, height]);

dataset.swap = function (i, j) {
  var tmp = this[i];
  this[i] = this[j];
  this[j] = tmp;
};

var finalSlot;

var drag = d3.behavior.drag()
  .on('dragstart', function (d, i) {
    d3.select(this).classed('highlight', true);
    finalSlot = i;
  })
  .on('dragend', function () {
    d3.select('rect:nth-of-type(' + (finalSlot+1) + ')')
      .classed('highlight', false);
  })
  .on('drag', dragged);

var svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

svg.selectAll('rect')
  .data(dataset)
  .enter()
  .append('rect')
  .attr('x', function (d, i) { return x(i); })
  .attr('y', function (d) { return height - y(d); })
  .attr('width', x.rangeBand())
  .attr('height', function (d) { return y(d); })
  .call(drag);

var controls = d3.select('body')
  .append('div')
  .attr('id', 'controls');

controls.append('button')
  .attr('id', 'button-sort')
  .html('Sort')
  .on("click", insertionSort);

controls.append('button')
  .attr('id', 'button-rand')
  .html('Randomize')
  .on("click", function () {
    d3.shuffle(dataset);
    updateBars();
   });

controls.append('form')
  .attr('id', 'form-delay')
  .html('delay(ms): ')
  .append('input')
  .attr('id', 'input-delay')
  .attr('type', 'text')
  .attr('value', '400');

function updateBars() {
  svg.selectAll("rect")
    .data(dataset)
    .attr("y", function (d) { return height - y(d); })
    .attr("height", function (d) { return y(d); });
}

function dragged(d) {
  var e = d3.event;
  var curSlot = Math.max(0, d3.bisectLeft(x.range(), e.x) - 1);
  if (curSlot != finalSlot) {
    dataset.swap(curSlot, finalSlot);
    updateBars();
    d3.select('rect:nth-of-type(' + (curSlot+1) + ')')
      .classed('highlight', true); 
    d3.select('rect:nth-of-type(' + (finalSlot+1) + ')')
      .classed('highlight', false); 
    finalSlot = curSlot;
  }
}

function getDelay() {
  var delay = d3.select("#input-delay").node().value;
  return parseInt(delay, 10);
}

function insertionSort() {
  var delay = getDelay();
  (function outerLoop(i) {
    d3.select('rect:nth-of-type(' + (i+1) + ')').classed('highlight', true);
    setTimeout(function () {
      (function innerLoop(j) {
        if (j > 0 && dataset[j-1] > dataset[j]) {
          dataset.swap(j-1, j);
          updateBars();
          d3.select('rect:nth-of-type(' + j + ')').classed('highlight', true);
          d3.select('rect:nth-of-type(' + (j+1) + ')')
            .classed('highlight', false);
          setTimeout(function () {
            innerLoop(j-1);
          }, delay);
        } else if (i < dataset.length - 1) {
          setTimeout(function () {
            d3.select('rect:nth-of-type(' + (j+1) + ')')
              .classed('highlight', false);
            outerLoop(i+1);
          }, delay);
        } else { // we're done. remove highlight from final element
          setTimeout(function () {
            d3.select('rect:nth-of-type(' + (j+1) + ')')
              .classed('highlight', false);
          }, delay);
        }
      })(i);
    }, delay);
  })(1);
}
