# languagefacts

* a node.js module that help you find the facts about spoken languages and languages that a certain country speak
* the facts includes what level this language is in the "language tree" (language family, language branch or language), the countries that speak the language, and the status of the language in the country
* the data is dynamically pulled from https://en.wikipedia.org/wiki/List_of_countries_by_spoken_languages

## Intallation

~~~~~~~
npm install languagefacts
var lf = require("languagefacts")
~~~~~~~

## How to use

* to check a language and its fact:
~~~~~~~
lf.languagefacts("English");
~~~~~~~

* to check languages that a certain country speaks, and the languages are sorted by the status(or the number of people who speak the language in that country):
~~~~~~~
lf.countryfacts("United States")
~~~~~~~

* it support fuzzy search to a certain extent(0.2), while the threshold of 0.0 requires a perfect match (of both letters and location), a threshold of 1.0 would match anything

## Examples

* if you want to know facts about the language "Javanese":
~~~~~~~
lf.languagefacts("Javanese");
~~~~~~~
![Javanese](./1.png?raw=true "Javanese")

* if you want to know what languages people speak in Germany:
~~~~~~~
lf.countryfacts("Germany")
~~~~~~~
![Germany](./2.png?raw=true "Germany")
