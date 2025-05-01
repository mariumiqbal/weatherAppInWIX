// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import { fetch } from "wix-fetch";
import { session } from 'wix-storage';
import { setTitle } from 'wix-seo';


const APIKey = "6bc322669992468ebbc33932252104"
const BASE_URL = "https://api.weatherapi.com/v1/"

$w.onReady(function () {

    setTitle("Weather Condition App");
    $w("#loadingSpinner").hide();
    $w('#input1').focus();
    $w('#box3').hide();
    $w('#forecastRepeater').hide();
    $w('#favMark').hide();
    let lastLocation = session.getItem("lastWeatherLocation");

    if (lastLocation) {
        $w('#input1').value = lastLocation
        getWeather(lastLocation)
    }

    $w("#favMark").onClick(() => {
        const location = $w("#input1").value;
        if (!location) return;
        const isChecked = $w('#favMark').checked;
        session.setItem("lastWeatherLocation", $w('#input1').value);

        if (isChecked && location) {
            session.setItem("lastWeatherLocation", location);
        } else {
            session.removeItem("lastWeatherLocation");
        }
    });

    $w("#button1").onClick(() => {
        $w('#input1').onCustomValidation((value, reject) => {
            if (!value) {
                reject("Please enter a city name.")
                return;
            }
            $w("#loadingSpinner").show();
            let city = $w('#input1').value
            getWeather(city);
        })
    });

    async function getWeather(city) {
        await fetch(`${BASE_URL}forecast.json?key=${APIKey}&q=${city}&aqi=no&days=5`, { method: "get" })
            .then(httpResponse => {
                if (httpResponse.ok) {
                    return httpResponse.json();
                } else {
                    $w('#box3').show();
                    throw new Error('Weather data not found.');
                }
            })
            .then(json => {

                $w('#box3').show();
                $w('#favMark').show();
                $w('#image1').src = `https:${json.current.condition.icon}`;
                if ($w('#radioGroup1').selectedIndex === 0) {
                    $w('#temperature').text = `${json.current.temp_f}F`;
                } else {
                    $w('#temperature').text = `${json.current.temp_c}C`;
                }
                $w('#cityName').text = `${json.location.name} City`;
                const dailyForecasts = json.forecast.forecastday;
                const items = dailyForecasts.map((day, index) => ({
                    _id: `forecast-${index}`,
                    temp: $w('#radioGroup1').selectedIndex === 0 ? `${day.day.avgtemp_f} F` : `${day.day.avgtemp_c} C`,
                }));
                $w('#forecastRepeater').show();
                $w("#forecastRepeater").data = items;
                $w("#forecastRepeater").onItemReady(($item, itemData) => {
                    $item("#tempForecast").text = itemData.temp;
                });
            })
            .catch(err => {
                console.error(err);
                $w('#cityName').text = 'Could not retrieve weather data.';
            })
            .finally(() => {
                $w("#loadingSpinner").hide();
            });
    }
})