var n = 0,
  data = [],
  modulationSignalData = [];

var margin = {top: 20, right: 20, bottom: 20, left: 40},
  width = 660 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
  .domain([0, 1.0])
  .range([0, width]);

var y = d3.scale.linear()
  .domain([-1.2, 1.2])
  .range([height, 0]);

var line = d3.svg.line()
  .x(function(d, i) { return x(d.x); })
  .y(function(d, i) { return y(d.y); });

var svg = d3.select("#chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("defs").append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", width)
  .attr("height", height);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + y(0) + ")")
  .call(d3.svg.axis().scale(x).orient("bottom"));

svg.append("g")
  .attr("class", "y axis")
  .call(d3.svg.axis().scale(y).orient("left"));

var path = svg.append("g")
  .attr("clip-path", "url(#clip)")
  .append("path")
  .datum(data)
  .attr("class", "fm line")
  .attr("d", line);

var path_two = svg.append("g")
  .attr("clip-path", "url(#clip)")
  .append("path")
  .datum(modulationSignalData)
  .attr("class", "mod line")
  .attr("d", line);

var sampleRate = 1000;
var cf = 16; // carrier frequency
var mf = 2; // modulation frequency
var mod_index = .5; // modulation index
var fmIntegral = 0; // FM integral

function setDefaults() {
  // Have to break down and use jQuery for slider here
  sampleRate = 1000;
  $('#sampleRateSlider').val(sampleRate);
  $('#sampleRateValue').text(sampleRate);
  cf = 16; // carrier frequency
  $('#carrierFrequencySlider').val(cf);
  $('#carrierFrequencyValue').text(cf);
  mf = 2; // modulation frequency
  $('#modulationFrequencySlider').val(mf);
  $('#modulationFrequencyValue').text(mf);
  mod_index = .5; // modulation index
  $('#modulationIndexSlider').val(mod_index);
  $('#modulationIndexValue').text(mod_index);
  fmIntegral = 0; // FM integral
}


function tick() {

  if (n > sampleRate) {
    return;
  }

  n++;

  // Based on Python implementation at:
  // http://arachnoid.com/phase_locked_loop/
  t = n / sampleRate; // time seconds
  mod = Math.cos(2 * Math.PI * mf * t); // modulation
  fmIntegral += mod * mod_index / sampleRate; // modulation integral
  fm = Math.cos(2 * Math.PI * cf * (t + fmIntegral)); // generate FM signal

  data.push({
    x: t,
    y: fm
  })
  modulationSignalData.push({
    x: t,
    y: mod
  })

  // redraw the line, and slide it to the left
  path
    .attr("d", line)
    .attr("transform", null)
    .transition()
    .duration(0.01)
    .attr("transform", "translate(0," + t + ")")
    .each("end", tick);

  // redraw the line, and slide it to the left
  path_two
    .attr("d", line)
    .attr("transform", null)
    .transition()
    .duration(0.01)
    .attr("transform", "translate(0," + t + ")")
    .each("end", tick);
}

tick();
setDefaults();

function restart() {
  n = 0;
  data = [];
  modulationSignalData = [];
  path.datum(data);
  path_two.datum(modulationSignalData);
  tick();
}

var sampleRateSlider = document.getElementById('sampleRateSlider');
var sampleRateValue = document.getElementById('sampleRateValue');
sampleRateSlider.onchange = function(e) {
  var val = e.target.value;
  sampleRateValue.innerHTML = val;
  sampleRate = +val > 0 ? +val : 1;
  restart();
}

var carrierFrequencySlider = document.getElementById('carrierFrequencySlider');
var carrierFrequencyValue = document.getElementById('carrierFrequencyValue');
carrierFrequencySlider.onchange = function(e) {
  var val = e.target.value;
  carrierFrequencyValue.innerHTML = val;
  cf = +val
  restart();
}

var modulationFrequencyValue = document.getElementById('modulationFrequencyValue');
modulationFrequencySlider.onchange = function(e) {
  var val = e.target.value;
  modulationFrequencyValue.innerHTML = val;
  console.log('val', e.target.value);
  mf = +e.target.value;
  restart();
}

var modulationIndexValue = document.getElementById('modulationIndexValue');
modulationIndexSlider.onchange = function(e) {
  var val = e.target.value;
  modulationIndexValue.innerHTML = val;
  mod_index = +val;
  restart();
}

resetDefaults.onclick = function(e) {
  e.preventDefault();
  setDefaults();
  restart();
}
