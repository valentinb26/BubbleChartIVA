// Definiere die URLs der beiden CSV-Dateien
const gdpUrl = "gdp.csv"; // Hier den Pfad zur Bevölkerungs-CSV
const lifeExpectancyUrl = "lifeExp.csv"; // Hier den Pfad zur GDP-CSV
const selectedYear = 2000;

// Lade die beiden CSV-Dateien
Promise.all([
    d3.csv(gdpUrl),
    d3.csv(lifeExpectancyUrl)
]).then(([gdpData, lifeExpectancyData]) => {
    // Konvertiere die Bevölkerung und Lebenserwartung in die passenden Formate
    gdpData.forEach(d => {
        d.country = d.country; // Ländername bleibt String
        for (let year in d) {
            if (year !== 'country') {
                d[year] = +d[year]; // Konvertiere zu Zahl
            }
        }
    });

    lifeExpectancyData.forEach(d => {
        d.country = d.country; // Ländername bleibt String
        for (let year in d) {
            if (year !== 'country') {
                d[year] = +d[year]; // Konvertiere zu Zahl
            }
        }
    });

    // Mische die beiden Datensätze
    const mergedData = gdpData.map(pop => {
        const lifeData = lifeExpectancyData.find(life => life.country === pop.country);
        return {
            country: pop.country,
            gdp: pop, // Voller Datensatz für die GDP
            lifeExpectancy: lifeData // Voller Datensatz für die Lebenserwartung
        };
    });

    //Mit mergedData Bubble Chart erstellen
    createBubbleChart(mergedData);
});


function createBubbleChart(data) {
    const margin = {top: 20, right: 30, bottom: 40, left: 50},
          width = 1200 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Skalen definieren
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.gdp[selectedYear])]) 
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.lifeExpectancy[selectedYear])]) 
        .range([height, 0]);

    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.gdp[selectedYear])]) 
        .range([0, 50]); // Maximaler Radius

    // Achsen hinzufügen
    //X-Achse
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
    //Y-Achse
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    // X-Achsenbeschriftungen hinzufügen
    svg.append("text")
        .attr("class", "x label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("GDP");

    // Y-Achsenbeschriftungen hinzufügen
    svg.append("text")
        .attr("class", "y label")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Life Expectancy");


    // Kreise für jedes Land darstellen
    svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScale(d.gdp[selectedYear])) // X-Achse für GDP
        .attr("cy", d => yScale(d.lifeExpectancy[selectedYear])) // Y-Achse für Lebenserwartung
        .attr("r", d => radiusScale(d.gdp[selectedYear])) // Radius für GDP
        .attr("fill", d => d3.schemeCategory10[Math.floor(Math.random() * 10)]) // Zufällige Farbe
        .attr("opacity", 0.7)
        .attr("stroke", "#333")
        .attr("stroke-width", 1);

    // Tooltip hinzufügen
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Tooltip-Ereignisse hinzufügen
    svg.selectAll("circle")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`
                <strong>Land:</strong> ${d.country}<br>
                <strong>${selectedYear} Lebenserwartung:</strong> ${d.lifeExpectancy[selectedYear]} Jahre<br>
                <strong>GDP per Capital:</strong> ${Math.round(d.gdp[selectedYear])}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}
