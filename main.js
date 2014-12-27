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
  .y(function(d, i) { return y(d.y); })
  .interpolate("linear");

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


var N = 2000; // Sample size
var sampleRate = 1000;
var cf = 16; // carrier frequency
var mf = 2; // modulation frequency
var modIndex = .5; // modulation index
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
  modIndex = .5; // modulation index
  $('#modulationIndexSlider').val(modIndex);
  $('#modulationIndexValue').text(modIndex);
  fmIntegral = 0; // FM integral
}


function gen() {

  var n,
      data = [],
      modulationSignalData = [];

  for (n = 0; n < N; n++) {
    // Based on Python implementation at:
    // http://arachnoid.com/phase_locked_loop/
    t = n / sampleRate; // time seconds
    mod = Math.cos(2 * Math.PI * mf * t); // modulation
    fmIntegral += mod * modIndex / sampleRate; // modulation integral
    fm = Math.cos(2 * Math.PI * cf * (t + fmIntegral)); // generate FM signal

    data.push({
      n: n,
      x: t,
      y: fm
    })
    modulationSignalData.push({
      n: n,
      x: t,
      y: mod
    })

  };

  return [data, modulationSignalData];
}


var res = gen();
var data = res[0];
var modulationSignalData = res[1];

var path = svg.append("g").attr("class", "fm g")
  .attr("clip-path", "url(#clip)");

var linePath = path.append("path")
  .attr("d", line(data))
  .attr("class", "fm line");

var pathTwo = svg.append("g").attr("class", "mod g")
  .attr("clip-path", "url(#clip)");

var linePathTwo = pathTwo.append("path")
  .attr("d", line(modulationSignalData))
  .attr("class", "mod line");

setDefaults();

function update() {

  var res = gen();
  var data = res[0];
  var modulationSignalData = res[1];

  linePath
    .transition()
    .duration(500)
    .ease("linear")
    .attr("d", line(data));

  linePathTwo
    .transition()
    .duration(500)
    .ease("linear")
    .attr("d", line(modulationSignalData));

}

var sampleRateSlider = document.getElementById('sampleRateSlider');
var sampleRateValue = document.getElementById('sampleRateValue');
sampleRateSlider.onchange = function(e) {
  var val = e.target.value;
  sampleRateValue.innerHTML = val;
  sampleRate = +val > 0 ? +val : 1;
  update();
}

var carrierFrequencySlider = document.getElementById('carrierFrequencySlider');
var carrierFrequencyValue = document.getElementById('carrierFrequencyValue');
carrierFrequencySlider.onchange = function(e) {
  var val = e.target.value;
  carrierFrequencyValue.innerHTML = val;
  cf = +val
  update();
}

var modulationFrequencyValue = document.getElementById('modulationFrequencyValue');
modulationFrequencySlider.onchange = function(e) {
  var val = e.target.value;
  modulationFrequencyValue.innerHTML = val;
  mf = +e.target.value;
  update();
}

var modulationIndexValue = document.getElementById('modulationIndexValue');
modulationIndexSlider.onchange = function(e) {
  var val = e.target.value;
  modulationIndexValue.innerHTML = val;
  modIndex = +val;
  update();
}

resetDefaults.onclick = function(e) {
  e.preventDefault();
  setDefaults();
  update();
}
