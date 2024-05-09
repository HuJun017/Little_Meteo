var input = document.querySelector('.input_text');
var country = document.querySelector('.country_text');
var main = document.querySelector('#name');
var temp = document.querySelector('.temp');
var desc = document.querySelector('.desc');
var clouds = document.querySelector('.clouds');
var wind = document.querySelector('.wind');
var max = document.querySelector('.max');
var min = document.querySelector('.min');
var mid = document.querySelector('.mid');
var button= document.querySelector('.submit');
var weatherIcon = document.getElementById('weatherIcon');
var humidity = document.querySelector('.humidity');

button.addEventListener('click', function(name){
fetch('https://api.openweathermap.org/data/2.5/weather?q='+input.value+","+country.value+'&appid=50a7aa80fa492fa92e874d23ad061374&units=metric')
.then(response => response.json())
.then(data => {
  console.log(data)
  var tempValue = data['main']['temp'];
  var nameValue = data['name'];
  var countryValue = data['sys']['country'];
  var descValue = data['weather'][0]['description'];
  var weatherIconValue = data['weather'][0]['icon'];
  var windValue = data['wind']['speed'];
  var maxValue = data['main']['temp_max'];
  var minValue = data['main']['temp_min'];
  var midValue = ((data['main']['temp_max'] + data['main']['temp_min']) / 2).toFixed(1);
  var humidityValue = data['main']['humidity'];
  

  main.innerHTML = nameValue+", "+ countryValue;
  desc.innerHTML = "Desc: "+descValue;
  temp.innerHTML = "Temp: "+tempValue;
  weatherIcon.src = "https://openweathermap.org/img/wn/"+weatherIconValue+"@2x.png";
  wind.innerHTML = "Wind Speed: "+windValue+" km/h";
  max.innerHTML = "Maximum Temperature: "+maxValue;
  min.innerHTML = "Minmum Temperature: "+minValue;
  mid.innerHTML = "Medium Temperature: "+midValue;
  humidity.innerHTML = "Humidity: "+humidityValue+" g/m3";
  input.value ="";
  country.value = "";
})

.catch(err => alert("Nome della città inesistente"));
})
