# <center> The High Price of Coordinates: The Spatiality of Airbnb and Rental Supply in Nashville, TN </center>
## Table of Contents

- I. Introduction
- II. Methodology
  - A. Data
  - B. Medium for Delivery
  - C. Application Layout
  - D. Thematic Representation
  - E. User Interaction
  - F. Aesthetics and Design Considerations
  - G. Conclusion

## I. Introduction

![airbnb](data/imgs/airbnb.jpg)
 <p> The rise and dominance of Airbnbs in the share economy has opened the door to fresh criticism concerning its role in local rental property supply, general property valuations, and its contribution to the problematic effect known as 'touristification.' Housing occupancy status has been greatly affected by the short-term rental market, causing renters and homebuyers to find less supply in historically residential neighborhoods. The effects of short-term rental spaces on housing supply is being freshly examined and has brought newfound approaches for understanding its role in residential neighborhoods. This project seeks to address Nashville, Tennessee's Airbnb footprint and how its effects on rental property supply are permeating throughout the city.  </p>
  <p>By utilizing data supplied by the American Community Survey as well as data provided by Inside Airbnb, this project seeks to understand the affects of Airbnb on local rental property supply by understanding Nashville's vacancy rate, as well as vacancy rate throughout the city.</p>

  ## II. Methodology 

  #### A. Data 
  In order to examine airbnbs in relation to occupancy/vacancy status, it's important to consider the data sources that will be used to conduct this map. 
<ul>
  <li> <u><a href= 'https://data.census.gov/cedsci/table?q=S2501&tid=ACSST5Y2020.S2501'> American Community Survey Occupancy Characteristics </a> </u>
  
  - This dataset contains US Census Bureau 5-Year Estimates on housing and vacancy occupation by block-group. The data was published in 2020. GEOIDs are used to join to official Tiger/Line shapefiles for census designations. 
   </li>
   <li><a href='http://insideairbnb.com/get-the-data'> <u> Inside Airnbnb Quarterly Data</a></u>
   </li>
  
  - Dataset contains quarterly short-term rentals available by major metropolitan area. Each city has various data assumptions and attributes that vary from city to city. Each dataset contains archival data that can be requested by InsideAirbnb. 

<li><a href='https://www.naturalearthdata.com/downloads/10m-cultural-vectors/'><u> Natural Earth Vector Data at 1:10m Scale</a></u>

</li>

- County Polygons for state of Tennessee 

<li><a href= 'https://www.census.gov/cgi-bin/geo/shapefiles/index.php'><u> Tiger/Line Block, Block Group, and Census Tract Shapefiles
</a></u> 
</li>

- US Census Bureau official shapefile for 2020 blocks, block groups, and census tract designations. These are used to link GEOIDs to the Occupancy Status Table GEOIDS. 

</ul>

Data can be divided into two primary categories: geographic and statistical. The first consists of geographic files that were pulled directly from the web to be used as polygons for data to be aggregated against. The second consists of tabular data (Occupancy Table) which was analyzed in a Jupyter Notebook with libraries for Python (Geopandas, Pandas, MatplotLib, Pyplot). 

Tools used for this project include:
 <ul>
 <li>QGIS</li>
 <li>VSCode</li>
 <li>Jupyter Notebook</li>
 <li>LibreOffice</li>
 </ul>

Libraries Used 
 <ul>
 <li><a href='https://pandas.pydata.org/pandas-docs/version/1.4/index.html'> Pandas</a>
 </li>
 <li><a href='https://geopandas.org/en/stable/docs.html'>Geopandas</a>
 </li>
 <li><a href='
 https://matplotlib.org/stable/users/index'>Matplotlib</a>
 </li>
 </ul>

The libraries were imported into the Jupyter Notebook to conduct processing and aggregation. Primarily, it was important to convert the data received into either GeoJSON or CSV format. Tiger/Line Shapefiles and Natural Earth County polygons were in shapefile format and then converted to GeoJSON in QGIS. The occupancy table was joined to these polygons in Jupyter Notebook which was then loaded as a GeoJSON in the webmap. 

#### B. Medium For Delivery 
 <p>This map is a web browser-based application accessible primarily through a desktop device. The map utilized modern web standards from HTML5, CSS, and JavaScript to create a data visualization via the web. User affordances for the map were provided by the <a href='https://leafletjs.com/'>Leaflet.js</a> library as well as <a href='https://turfjs.org/'> Turf.js</a>. For example, as a user clicks on a block-group, the users is 'flown' to the boundaries of that specific Leaflet layer where Turf populates the Airbnb points that fall directly within that census tract using frontend geoprocessing. </p>
 <p> The <a href='https://github.com/d3/d3-fetch'> D3-fetch </a> module was utilized in order to load the GeoJSON files directly into the Javascript via an AJAX request. For the responsive design, the Bootstrap framework was loaded via a CDN request in the HTML document. The map uses flex containers to organize the contents in such a way that users can understand the UI effectively. Additionally, the <a href='https://simplestatistics.org/'> simple statistics</a> library was used to aggregate data on the fly for the legend build as well.</p>

 #### C. Application Layout 
 
 The layout of the webpage primarily serves to help the viewer understand the overlap between Airbnb-density, vacancy, and occupancy rates in Nashville, Tennessee via a choropoleth web map. Users will find a web-facing map interface that has user affordances, aiding them wit comprehending some of the basic data represented in the map. 
 <p>Users will find a dropdown box allowing them to choose between choropleth maps that depict Airbnbs per occupied housing unit by block group, occupancy percentage, as well as vacancy percentage. Additionally, a legend will be dynamically updated to reflect the changes in these variables.</p>
 <p> When users click on a block group, a function in JavaScript is triggered which dynamically updates the map to symbolize point locations of Airbnbs in the block group as well as flying the user to the boundaries of it. Additionally, the user will see which block group they are highlighting by a simple mouseover function which highlights the boundary of the block group the cursor is currently on top of. </p>


#### D. Thematic Representation 
<p>The map consists of two primary datasets: census tract polygons and Airbnb point locations. A choropleth map is the primary thematic representation that will be employed to classify three different choropleths that can be selected in a dropdown menu: first, users can view the density of Airbnbs by census tract, next they can view the percentage of housing units that are occupied by census tract, and finally, users can view the rate of vacancy of units by census tract. These datasets lend a perspective of Airbnb's relationship to occupancy and vacancy status for Davidson County.</p>
<p> Users will also be able to view airbnb point locations as proportionately-drawn circles that indicate the average price per night. This can help users situate the density versus the asking price by census tract in order to show the variation by tract. </p>
<p> Additionally, users can select a census tract with their cursor which will zoom them to a smaller scale that fits its boundaries. When the user clicks on it, Airbnb points will be populated that fall within that tract using Turf, and their proportions are reflective of the average price (a higher price being a larger radius). Users can also read about Airbnb and more information concerning its intrusion into local rental markets at the metropolitan level. This affords more context for the project itself as well as situates the user with the point and goal of the map.</p>
<p>

### Useful Links

<ol>
<li><b><a href="https://www.census.gov/programs-surveys/acs/library/handbooks/geography.html">American Community Survey: What Data Users Need to Know</a>
<b>
<li><a href="http://www.columbia.edu/~sg3637/airbnb_final_analysis.html">Exploratory Data Analysis and Visualization of Airbnb Dataset, 2018</a>
<li>
